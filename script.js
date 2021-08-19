const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false; // have not updated from local storage set to false. later will change to true if update from local storage has occurred, preventing loop

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = [];
    progressListArray = [];
    completeListArray = [];
    onHoldListArray = [];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  });
  // localStorage.setItem('backlogItems', JSON.stringify(backlogListArray));
  // localStorage.setItem('progressItems', JSON.stringify(progressListArray));
  // localStorage.setItem('completeItems', JSON.stringify(completeListArray));
  // localStorage.setItem('onHoldItems', JSON.stringify(onHoldListArray));
}

// Filter Arrays to remove empty items(that have been delete manually)
function filterArray(array) {
  // console.log(array);
  const filteredArray = array.filter(item => item !== null); // for the items that are not equal to null will be filtered and pushed to the filteredArray
  // console.log(filteredArray);
  return filteredArray; // without returning the localStorage was showing undefined, we must return the filteredArray for it to pass on when function is called in updateDom function line 98 onwards.
}

// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
  // console.log('columnEl:', columnEl); // column referencing Backloglist, Progresslist, Completelist and OnHoldlist
  // console.log('column:', column); // for each list there is only the one column being 0
  // console.log('item:', item); // intems in the array
  // console.log('index:', index); // index of the items within that array
  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.textContent = item;
  listEl.draggable = true;
  listEl.setAttribute('ondragstart', 'drag(event)'); // taken from https://www.w3schools.com/html/html5_draganddrop.asp
  listEl.contentEditable = 'true';
  listEl.id = index;
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`); // where updateItem() is a function with two parameters
  // Append
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column
  backlogList.textContent = '';
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogList, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  
  // Progress Column
  progressList.textContent = '';
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressList, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  
  // Complete Column
  completeList.textContent = '';
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeList, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  
  // On Hold Column
  onHoldList.textContent = '';
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldList, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
 
  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true; // 
  updateSavedColumns();
}

// Update item - Delete if necessary, or update Array value
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  // console.log(selectedArray);
  const selectedColumnEl = listColumns[column].children;
  // console.log(selectedColumnEl[id].textContent);
if (!dragging) { // if dragging is false - this if condition was added so that when we click a item it knows it is draggable but if dropped then it is not draggable. See drag() and ondrop() functions - without this when we click a editable item it initiates editable and we drop it but it won't find and content since we tried to drop empty item. So the onDrop has no content to append
  if (!selectedColumnEl[id].textContent) {
    delete selectedArray[id];
  } else {
    selectedArray[id] = selectedColumnEl[id].textContent;
  }
  // console.log(selectedArray);
  updateDOM();
}
}

// Add to Column List, Rest Textbox
function addToColumn(column) {
  // console.log(addItems[column].textContent);
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = ''; // resets the addItem text to empty so that when we try to add new item the addItem container is empty(instead of old item added)
  updateDOM();
}

// Show Add Item Input Box
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden';
  saveItemBtns[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

//Hide Item Input Box
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  addToColumn(column);
}

// Allow arrays to reflect drag and drop items
function rebuildArrays() {
  // console.log(backlogList.children);
  // console.log(progressList.children);
  backlogListArray = Array.from(backlogList.children).map(i => i.textContent); 
  progressListArray = Array.from(progressList.children).map(i => i.textContent);
  completeListArray = Array.from(completeList.children).map(i => i.textContent);
  onHoldListArray = Array.from(onHoldList.children).map(i => i.textContent);
 // the .map function allows the code to be cleaner than using the foreach method below.
  // for (let i = 0; i < backlogList.children.length; i++) {
  //   backlogListArray.push(backlogList.children[i].textContent)
  // }
  // progressListArray = [];
  // for (let i = 0; i < progressList.children.length; i++) {
  //   progressListArray.push(progressList.children[i].textContent)
  // }
  // completeListArray = [];
  // for (let i = 0; i < completeList.children.length; i++) {
  //   completeListArray.push(completeList.children[i].textContent)
  // }
  // onHoldListArray = [];
  // for (let i = 0; i < onHoldList.children.length; i++) {
  //   onHoldListArray.push(onHoldList.children[i].textContent)
  // }
  updateDOM();
}

// When Item starts dragging https://www.w3schools.com/html/html5_draganddrop.asp
function drag(e) {
  draggedItem = e.target;
  // console.log('draggedItem:', draggedItem);
  dragging = true; // this will set dragging to true as soon as we are dragging then it will be changed to false when we drop (in the drop() function)
}

// When Item entered colum area
function dragEnter(column) {
  listColumns[column].classList.add('over');
  currentColumn = column; // where column is referencing the html element that was referenced through the event
}

//  Column Allows for item to drop
function allowDrop(e) {
  e.preventDefault(); // this will allow us to drop element into another element (otherwise, by default it is not permitted)
}

// Dropping item in colum
function drop(e) {
  e.preventDefault(); // this will allow us to drop element into another element (otherwise, by default it is not permitted)
  //Remove background colour/padding
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });
  // Add item to the column
  const parent = listColumns[currentColumn];
  parent.appendChild(draggedItem);
  // Dragging complete
  dragging = false; // changes to false to allow the drop feature to function which broke as when we click on item it gets ready to edit it and gets confused
  rebuildArrays();
}

// On Load
updateDOM();



