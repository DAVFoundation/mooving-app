jest.doMock('./config', () => ({
    getInstance: () => ({
        init: () => ({}),
        getApp: () => ({}),
        getEnvironment: () => ({
            API_URL: 'http://localhost:3005',
        }),
    }),
}));

import { Api } from './api';

class ApiStub extends Api {
    protected getVerifyCodeEndpointName() {
        return 'verify-code-ep';
    }
}

describe('fetchOnce', () => {
    it('should call fetch with url', async () => {
        const uri = '/my-url/my-query?p=1';
        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await api.fetchOnce(uri, {});
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(uri), expect.anything());
    });

    it('should add / to url', async () => {
        const uri = 'my-url/my-query?p=1';
        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await api.fetchOnce(uri, {});
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/${uri}`), expect.anything());
    });

    it('should call fetch once per call', async () => {
        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await api.fetchOnce('', {});
        expect(fetch).toHaveBeenCalledTimes(1);
        await api.fetchOnce('', {});
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should resolve when status code is 200', async () => {
        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await expect(api.fetchOnce('', {})).resolves.toEqual(expect.anything());
    });

    it('should reject when status code is 400', async () => {
        const fetch = jest.fn().mockResolvedValue({ status: 400, ok: false });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await expect(api.fetchOnce('', {})).rejects.toEqual(expect.anything());
    });

    it('should reject when status code is 500', async () => {
        const fetch = jest.fn().mockResolvedValue({ status: 500, ok: false });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await expect(api.fetchOnce('', {})).rejects.toEqual(expect.anything());
    });

    it('should reject when no response within timeout', async () => {
        jest.useFakeTimers();
        const fetch = jest.fn(() => new Promise(() => { /* */ }));
        (global as any).fetch = fetch;
        const api = new ApiStub();
        const promise = api.fetchOnce('', {}, 1000);
        jest.runAllTimers();
        await expect(promise).rejects.toEqual(expect.anything());
        jest.useRealTimers();
    });
});

describe('fetchRetry', () => {
    it('should resolve when status code is 200', async () => {
        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const api = new ApiStub();
        await expect(api.fetchRetry('', {})).resolves.toEqual(expect.anything());
    });

    it('should retry when status code is 500', async () => {
        const setTimeoutOriginal = global.setTimeout;
        global.setTimeout = jest.fn((cb, t) => setTimeoutOriginal(cb, 1));

        const fetch = jest.fn().mockResolvedValue({ status: 500, ok: false });
        (global as any).fetch = fetch;
        const retries = 15;
        const api = new ApiStub();
        await expect(api.fetchRetry('', {}, { retries })).rejects.toEqual(expect.anything());
        expect(fetch).toHaveBeenCalledTimes(retries + 1);

        global.setTimeout = setTimeoutOriginal;
    });

    it('should not retry when status code is 400', async () => {
        const setTimeoutOriginal = global.setTimeout;
        global.setTimeout = jest.fn((cb, t) => setTimeoutOriginal(cb, 1));

        const fetch = jest.fn().mockResolvedValue({ status: 400, ok: false });
        (global as any).fetch = fetch;
        const retries = 15;
        const api = new ApiStub();
        await expect(api.fetchRetry('', {}, { retries })).rejects.toEqual(expect.anything());
        expect(fetch).toHaveBeenCalledTimes(1);

        global.setTimeout = setTimeoutOriginal;
    });

    it('should retry until status code is 200', async () => {
        const setTimeoutOriginal = global.setTimeout;
        global.setTimeout = jest.fn((cb, t) => setTimeoutOriginal(cb, 1));
        const reject: any = { status: 500, ok: false };
        const resolve: any = { status: 200, ok: true };
        const fetch = jest.fn()
            .mockResolvedValueOnce(reject)
            .mockResolvedValueOnce(reject)
            .mockResolvedValueOnce(reject)
            .mockResolvedValueOnce(reject)
            .mockResolvedValue(resolve);
        (global as any).fetch = fetch;
        const retries = 15;
        const api = new ApiStub();
        await expect(api.fetchRetry('', {}, { retries })).resolves.toEqual(expect.anything());
        expect(fetch).toHaveBeenCalledTimes(5);

        global.setTimeout = setTimeoutOriginal;
    });
});

describe('fetch polling', async () => {
    it('should continue polling until unsubscribe', async () => {
        const setTimeoutOriginal = global.setTimeout;
        const setIntervalOriginal = global.setInterval;
        global.setTimeout = jest.fn((cb, t) => setTimeoutOriginal(cb, 1));
        global.setInterval = jest.fn((cb, t) => setIntervalOriginal(cb, 1));

        const fetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
        (global as any).fetch = fetch;
        const requestHandler = jest.fn();
        const api = new ApiStub();
        const subscription = api.fetchPolling('', {}).subscribe(requestHandler);
        requestHandler.mockImplementation(() => {
            if (requestHandler.mock.calls.length === 10) {
                subscription.unsubscribe();
            }
        });
        await new Promise(resolve => setTimeoutOriginal(resolve, 100));
        expect(fetch).toHaveBeenCalledTimes(10);
        expect(requestHandler).toHaveBeenCalledTimes(10);

        global.setTimeout = setTimeoutOriginal;
        global.setInterval = setIntervalOriginal;
    });

    it('should continue polling after getting an error 500', async () => {
        const setTimeoutOriginal = global.setTimeout;
        const setIntervalOriginal = global.setInterval;
        global.setTimeout = jest.fn((cb, t) => setTimeoutOriginal(cb, 1));
        global.setInterval = jest.fn((cb, t) => setIntervalOriginal(cb, 1));

        const fetch = jest.fn();

        for (let index = 0; index < 100; index++) {
            fetch.mockResolvedValueOnce({ status: 500, ok: false });
        }
        fetch.mockResolvedValue({ status: 200, ok: true });

        (global as any).fetch = fetch;
        const requestHandler = jest.fn();
        const api = new ApiStub();
        const subscription = api.fetchPolling('', {}).subscribe(requestHandler);
        requestHandler.mockImplementation(() => {
            if (requestHandler.mock.calls.length === 10) {
                subscription.unsubscribe();
            }
        });
        await new Promise(resolve => setTimeoutOriginal(resolve, 100));
        expect(requestHandler).toHaveBeenCalledTimes(10);

        global.setTimeout = setTimeoutOriginal;
        global.setInterval = setIntervalOriginal;
    });
});
