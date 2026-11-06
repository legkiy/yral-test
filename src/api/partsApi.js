const API_URL = 'https://api.favorit-parts.ru/hs/hsprice/';
const API_KEY = '00000000-0000-0000-0000-000000000001';
const REQUEST_TIMEOUT = 20_000;

const errorMessages = {
  'Empty key!': 'Не указан ключ доступа к API.',
  'Invalid key client!':
    'Сервис не принял ключ доступа. Проверьте его действительность.',
  'Empty number goods!': 'Введите артикул детали.',
  'Request quota exceeded!': 'Превышен лимит запросов. Повторите поиск позже.',
};

export function buildPartsUrl(number, brand) {
  const params = new URLSearchParams({ key: API_KEY, number });
  if (brand) {
    params.set('brand', brand);
    params.set('analogues', 'on');
  }
  return `${API_URL}?${params}`;
}

async function requestParts(number, brand, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(buildPartsUrl(number, brand), {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(
        `Сервис временно недоступен (HTTP ${response.status}). Попробуйте ещё раз.`,
      );
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new Error('Сервис вернул некорректный ответ. Попробуйте ещё раз.', {
        cause: error,
      });
    }
    if (data?.error) {
      const message = Array.isArray(data.error)
        ? data.error.join(' ')
        : String(data.error);
      const knownErrors = Object.entries(errorMessages)
        .filter(([key]) => message.includes(key))
        .map(([, text]) => text);
      throw new Error(
        knownErrors.join(' ') ||
          'Сервис сообщил об ошибке. Попробуйте повторить запрос позже.',
      );
    }
    if (!data || !Array.isArray(data.goods)) {
      throw new Error(
        'Сервис вернул неожиданный формат данных. Попробуйте ещё раз.',
      );
    }
    return data.goods;
  } catch (error) {
    if (timedOut)
      throw new Error('Сервис не ответил за 20 секунд. Повторите запрос.', {
        cause: error,
      });
    if (signal?.aborted) throw error;
    if (error instanceof TypeError) {
      throw new Error(
        'Не удалось связаться с сервисом. Проверьте подключение и повторите запрос.',
        { cause: error },
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function searchBrands(number, signal) {
  return requestParts(number, undefined, signal);
}

export function searchOffers(number, brand, signal) {
  return requestParts(number, brand, signal);
}
