var Block = (function() {
  function getBackgroundColor() {
    return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
  }

  function buildSingleBlock(width, height) {
    var element = document.createElement('div');

    element.className = 'block';
    element.style.width = width;
    element.style.height = height;
    element.style.backgroundColor = getBackgroundColor();
    element.setAttribute('data-changed', 'f');

    return element;
  }

  function updateSingleBlock(block, color) {
    block.style.backgroundColor = color;
    block.setAttribute('data-changed', 't');
  }

  function getUnchangedAdjacentBlocks(block, color) {
    var list = Blocks.list();
    var columns = Blocks.columns();
    var index = list.indexOf(block);
    var top = list[index - columns];
    var right = list[index + 1];
    var bottom = list[index + columns];
    var left = list[index - 1];
    var queue = [];

    if (index >= columns && top && top.getAttribute('data-changed') !== 't') {
      updateSingleBlock(top, color);
      queue.push(top);
    }

    if (index % columns !== (columns - 1) && right && right.getAttribute('data-changed') !== 't') {
      updateSingleBlock(right, color);
      queue.push(right);
    }

    if (index < (Blocks.count() - columns) && bottom && bottom.getAttribute('data-changed') !== 't') {
      updateSingleBlock(bottom, color);
      queue.push(bottom);
    }

    if (index % columns !== 0 && left && left.getAttribute('data-changed') !== 't') {
      updateSingleBlock(left, color);
      queue.push(left);
    }

    return queue;
  }


  return {
    build: buildSingleBlock,
    update: updateSingleBlock,
    adjacent: getUnchangedAdjacentBlocks
  }
}());


var Blocks = (function() {
  var list = [];
  var count = 0;
  var columns = 0;
  var rows = 0;


  function setValues(value) {
    var num = parseInt(value);

    count = num > 0 ? num : 1;
    columns = Math.floor(Math.sqrt(count));
    rows = count / columns;

    while (rows % 1 !== 0) {
      columns -= 1;
      rows = count / columns;
    }
  }

  function getOrSetCount(value) {
    if (typeof value === 'undefined') {
      return count;
    } else {
      setValues(value);
    }
  }

  function getList() {
    return list;
  }

  function getColumns() {
    return columns;
  }

  function getRows() {
    return rows;
  }

  function buildAllBlocks() {
    var fragment = document.createDocumentFragment();
    var width = (100 / columns) + '%';
    var height = (100 / rows) + 'vh';
    var blocksLeft = count;

    while (blocksLeft > 0) {
      var block = Block.build(width, height);

      fragment.appendChild(block);
      list.push(block);

      blocksLeft -= 1;
    }

    return fragment;
  }

  function updateAllBlocks(queue, color) {
    var upcomingQueue = [];
    var timer = 500 / Math.max(columns, rows);

    console.log(timer);

    for (var i = 0; i < queue.length; ++i) {
      var adjacentBlocks = Block.adjacent(queue[i], color);
      upcomingQueue = upcomingQueue.concat(adjacentBlocks);
    }

    if (upcomingQueue.length) {
      setTimeout(function() {
        updateAllBlocks(upcomingQueue, color);
      }, timer);
    } else if (!document.querySelectorAll('.block[data-changed="f"]').length) {
      setTimeout(Page.reset, 5000);
    }
  }

  function deleteAllBlocks() {
    list = [];
    count = 0;
    columns = 0;
    rows = 0;
  }


  return {
    list: getList,
    count: getOrSetCount,
    rows: getRows,
    columns: getColumns,
    build: buildAllBlocks,
    update: updateAllBlocks,
    delete: deleteAllBlocks
  }
}());


var Page = (function() {
  var input;
  var button;
  var inputContainer;
  var blockContainer;
  var footer;


  function clickHandler(event) {
    var target = event.target;

    if (target === button && !Blocks.list.length) {
      footer.classList.toggle('hidden');
      inputContainer.classList.toggle('hidden');
      blockContainer.classList.toggle('hidden');
      blockContainer.appendChild(Blocks.build());
    } else if (target.className === 'block' && target.getAttribute('data-changed') === 'f') {
      Block.update(target, target.style.backgroundColor);
      Blocks.update([target], target.style.backgroundColor);
    }
  }

  function keyupHandler(event) {
    var key = event.which || event.keyCode;
    var active = document.activeElement;

    if (key === 13 && active !== button && input.value) {
      clickHandler({ target: button });
    } else if (key === 49 && active !== input) {
      input.select();
    } else if (key === 27) {
      resetPage();
    } else if (event.target === input) {
      Blocks.count(input.value);
    }
  }

  function resetPage() {
    Blocks.delete();

    input.value = '';

    footer.classList.toggle('hidden');
    inputContainer.classList.toggle('hidden');
    blockContainer.classList.toggle('hidden');

    while (blockContainer.firstChild) {
      blockContainer.removeChild(blockContainer.firstChild);
    }

    input.select();
  }

  function initializePage() {
    input = document.getElementById('input');
    button = document.getElementById('create-blocks');
    inputContainer = document.getElementById('input-container');
    blockContainer = document.getElementById('blocks-container');
    footer = document.getElementById('footer');

    document.body.addEventListener('click', clickHandler);
    document.body.addEventListener('keyup', keyupHandler);

    input.select();
  }


  return {
    reset: resetPage,
    initialize: initializePage
  }
}());

document.addEventListener('DOMContentLoaded', Page.initialize);
