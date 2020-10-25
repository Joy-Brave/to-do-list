function dragHandler(event) {
    console.log(event);
    let dragElem, dragElemTop, dragElemLeft, dragElemWidth, dragElemHeight, originLeft, originTop;
    let placeholder;
    let isDragged = false;
    let isSwapped = false;
    dragElem = event.target.closest('.draggable');

    const mouseDownDrag = function (event) {
        //event.preventDefault();

        const rect = dragElem.getBoundingClientRect();
        console.log(rect);
        [dragElemLeft, dragElemTop, dragElemWidth, dragElemHeight] = [rect.left, rect.top, rect.width, rect.height];
        console.log(dragElemHeight);
        [originLeft, originTop] = [event.pageX, event.pageY];
        document.addEventListener('mousemove', mouseMoveDrag);
        document.addEventListener('mouseup', mouseUpDrag);

    }

    const mouseMoveDrag = function (event) {
        event.preventDefault();
        if (!isDragged) {
            isDragged = true;
            placeholder = document.createElement('li');
            placeholder.id = 'placeholderForDrag'
            placeholder.classList.add(['placeholder', 'draggable',]);
            placeholder.style.listStyleType = 'None';
            placeholder.style.height = '0px'//`${dragElemHeight}px`;
            placeholder.style.position = 'relative';
            dragElem.after(placeholder);
        }
        //parent's position is relative
        dragElemLeft = 0;
        dragElemTop = 0;

        //dragElem.style.position = 'absolute';
        dragElem.style.left = `${Math.abs(event.pageX - originLeft) > (dragElemWidth / 3) ? (heavisideFunc(event.pageX - originLeft) * dragElemWidth / 3) : event.pageX - originLeft + dragElemLeft}px`;
        dragElem.style.top = `${event.pageY - originTop + dragElemTop}px`;

        if (dragElem.previousElementSibling && dragElem.previousElementSibling.classList.contains('draggable')
            && posAbove(dragElem, dragElem.previousElementSibling)) {
            [originLeft, originTop] = [event.pageX, event.pageY];
            swapPos(dragElem, dragElem.previousElementSibling);
            swapPos(placeholder, dragElem);
        }
        if (placeholder.nextElementSibling && placeholder.nextElementSibling.classList.contains('draggable')
            && posAbove(placeholder.nextElementSibling, dragElem)) {
            [originLeft, originTop] = [event.pageX, event.pageY];
            swapPos(dragElem, placeholder);
            swapPos(dragElem, placeholder);

        }
        if (Math.abs(event.pageY - originTop) + Math.abs(event.pageX - originLeft) > 100) isDragged = true;
        if (isDragged && !isSwapped) {
            dragElem.classList.add(dragElem.classList.add('dragged'));
        } else {
            dragElem.classList.remove('dragged');
        }
    }

    const posAbove = function (element1, element2) {
        function getYPos(element) {
            let rect = element.getBoundingClientRect();
            return rect.top + rect.height / 2;
        }
        y1 = getYPos(element1);
        y2 = getYPos(element2);
        return y2 > y1
    }

    const swapPos = function (element1, element2) {
        if (element1.nextElementSibling === element2) {
            element2.after(element1);
        } else if (element2.nextElementSibling === element1) {
            element2.before(element1);
            element1.before(element2.nextElementSibling);
        }
        isSwapped = true;
    };

    const mouseUpDrag = function (event) {
        event.preventDefault();
        placeholder && placeholder.remove();
        isDragged = false;
        //dragElem.style.position = null;
        dragElem.style.left = null;
        dragElem.style.top = null;
        document.removeEventListener('mousemove', mouseMoveDrag);
        document.removeEventListener('mouseup', mouseUpDrag);

        dragElem = dragElemTop = dragElemLeft = dragElemWidth = dragElemHeight = originLeft = originTop = null;

    }
    /*
    parentElem = document.getElementById(parentId);
    [].slice.call(parentElem.querySelectorAll('.draggable')).forEach(
        (item) => item.addEventListener('mousedown', mouseDownDrag));
    */
    return mouseDownDrag(event)
}