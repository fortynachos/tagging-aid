import u from 'umbrellajs';

export function createDiv({ id = '', classList = [], attributes = [] } = {}) {
    let div = u('<div>');
    if (id) div.attr({ id });

    classList.forEach((className) => {
        div.addClass(className);
    });

    attributes.forEach((attr) => {
        div.attr(attr);
    });

    return div;
}

export function appendElementToBody(element) {
    u('body').append(element);
}

export function moveElementToAppendedToBody(element) {
    document.body.appendChild(element);
}

export function createHighlightBox(targetElement, { classList = [] } = {}) {
    let highlightBox = createDiv({
        classList: ['_pendota-highlight-box_', ...classList],
    });
    let highlightBoxNode = highlightBox.first();
    highlightBoxNode.style.position = 'fixed';
    highlightBoxNode.style.content = '';
    highlightBoxNode.style.zIndex = '9999998';
    highlightBoxNode.style.pointerEvents = 'none';
    targetedHighlightBox = setHighlightBoxToTarget(
        highlightBoxNode,
        targetElement
    );
    appendElementToBody(targetedHighlightBox);
    return targetedHighlightBox;
}

export function setHighlightBoxToTarget(highlightBox, targetElement) {
    let targetStyles = targetElement.getBoundingClientRect();
    highlightBox.style.height = `${targetStyles.height + 'px'}`;
    highlightBox.style.width = `${targetStyles.width + 'px'}`;
    highlightBox.style.top = `${targetStyles.top + 'px'}`;
    highlightBox.style.right = `${targetStyles.right + 'px'}`;
    highlightBox.style.bottom = `${targetStyles.bottom + 'px'}`;
    highlightBox.style.left = `${targetStyles.left + 'px'}`;

    return highlightBox;
}
