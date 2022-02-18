export async function injectContentScript(
    scriptFilePath,
    tabId,
    allFrames = false
) {
    let injectConfig = {
        files: [scriptFilePath],
        target: { tabId },
    };
    if (allFrames) injectConfig.target.allFrames = true;
    chrome.scripting.executeScript(injectConfig);
}
