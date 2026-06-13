import type { AnalyticsEvent } from './types';

const DB_NAME = 'draconis-analytics';
const STORE_NAME = 'queue';
const MAX_SIZE = 500;

/** IndexedDB 레코드 타입 */
interface QueueRecord {
  id?: number;
  event: AnalyticsEvent;
}

/** 인메모리 폴백 (IndexedDB 없는 환경용) */
let memQueue: { id: number; event: AnalyticsEvent }[] = [];
let memNextId = 1;

/** IndexedDB 사용 가능 여부 */
function hasIDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/** IndexedDB 연결 열기 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** IDB 트랜잭션 래퍼 */
function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

/** IDB 전체 레코드 수 */
async function idbCount(): Promise<number> {
  return withStore('readonly', (s) => s.count());
}

/** 가장 오래된 항목 1개 제거 (FIFO 초과 방지) */
async function idbEvictOldest(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor) {
        cursor.delete();
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** 이벤트를 큐에 추가. 500건 초과 시 가장 오래된 것 삭제. */
export async function push(event: AnalyticsEvent): Promise<void> {
  if (!hasIDB()) {
    // 인메모리 폴백
    if (memQueue.length >= MAX_SIZE) {
      memQueue.shift();
    }
    memQueue.push({ id: memNextId++, event });
    return;
  }

  const count = await idbCount();
  if (count >= MAX_SIZE) {
    await idbEvictOldest();
  }
  await withStore('readwrite', (s) => s.add({ event } satisfies QueueRecord));
}

/** 최대 n개 배치 꺼내기 (삭제하지 않음). */
export async function popBatch(n: number): Promise<{ id: number; event: AnalyticsEvent }[]> {
  if (!hasIDB()) {
    return memQueue.slice(0, n);
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const results: { id: number; event: AnalyticsEvent }[] = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor && results.length < n) {
        const record = cursor.value as QueueRecord;
        results.push({ id: cursor.key as number, event: record.event });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** id 목록에 해당하는 항목들 큐에서 제거. */
export async function remove(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  if (!hasIDB()) {
    const idSet = new Set(ids);
    memQueue = memQueue.filter((r) => !idSet.has(r.id));
    return;
  }

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let pending = ids.length;
    for (const id of ids) {
      const req = store.delete(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        pending -= 1;
        if (pending === 0) resolve();
      };
    }
    if (ids.length === 0) resolve();
    tx.oncomplete = () => db.close();
  });
}

/** 현재 큐 크기 반환. */
export async function size(): Promise<number> {
  if (!hasIDB()) {
    return memQueue.length;
  }
  return idbCount();
}
