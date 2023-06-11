const addTodoButton = document.getElementById('addTodoButton');
const todoList = document.getElementById('todoList');

let todoIndex = 1;

addTodoButton.addEventListener('click', () => {
  const li = document.createElement('li');
  li.className = 'mb-2 relative';
  const currentDate = new Date().toLocaleDateString('en-US');
  li.innerHTML = `
    <div class="flex items-center">
      <input type="checkbox" class="mr-2">
      <span class="todo-name">Task ${todoIndex}</span>
      <input type="date" class="ml-4 todo-date" value="${currentDate}">
      <button class="ml-4 focus:outline-none toggle-button">
        <svg class="h-4 w-4 text-gray-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 9a1 1 0 0 1 2 0v3a1 1 0 0 1-1.7.7l-2.5-2.5a1 1 0 0 1 0-1.4L12 9zm-6-5a1 1 0 1 1 2 0v10a1 1 0 0 1-2 0V4zm11.3 8.3a1 1 0 0 1-1.4 1.4l-2.5-2.5a1 1 0 0 1 0-1.4l2.5-2.5a1 1 0 0 1 1.4 1.4L15.42 9l2.3 2.3z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <textarea class="hidden mt-2 ml-4 w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded toggle-textarea"></textarea>
    <div class="text-right">
      <small class="ml-2 text-gray-500 toggle-date hidden">${currentDate}</small>
    </div>
  `;
  todoList.appendChild(li);
  todoIndex++;

  const toggleButton = li.querySelector('.toggle-button');
  const toggleTextarea = li.querySelector('.toggle-textarea');
  const todoName = li.querySelector('.todo-name');
  const todoDate = li.querySelector('.todo-date');
  const toggleDate = li.querySelector('.toggle-date');

  toggleButton.addEventListener('click', () => {
    toggleTextarea.classList.toggle('hidden');
    toggleDate.classList.toggle('hidden');
    if (!toggleTextarea.classList.contains('hidden')) {
      toggleTextarea.style.height = toggleTextarea.scrollHeight + 'px';
    }
  });

  todoName.addEventListener('dblclick', () => {
    todoName.contentEditable = true;
    todoName.focus();
  });

  todoName.addEventListener('blur', () => {
    todoName.contentEditable = false;
  });

  todoName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      todoName.blur();
    }
  });
});

