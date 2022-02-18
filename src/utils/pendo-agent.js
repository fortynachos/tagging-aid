const pendo = window.pendo;

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

export function getAnonId(anonIdKey, handlerFn) {
    chrome.storage.sync.get([anonIdKey], function (result) {
        let anonId = result[anonIdKey];
        if (!anonId) {
            anonId = createAndSetAnonId();
        }
        handlerFn(anonId);
    });
}

export function createAndSetAnonId(anonIdKey) {
    const uuid = uuidv4();
    let storageObject = {};
    storageObject[anonIdKey] = uuid;
    chrome.storage.sync.set(storageObject, () => {});
    return uuid;
}

export function pendoTrackAndFlush(event) {
    if (pendo) {
        pendo.track(event, {});
        pendo.flushNow();
    }
}