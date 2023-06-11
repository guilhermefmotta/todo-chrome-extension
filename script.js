
const addTodoButton = document.getElementById("addTodoButton");
const todoList = document.getElementById("todoList");

let todoIndex = 1;

addTodoButton.addEventListener("click", () => {
  const li = document.createElement("li");
  li.className = "mb-2 relative";
  const createdDate = new Date().toLocaleString("en-US");
  li.innerHTML = `
    <div class="flex items-center">
      <input type="checkbox" class="mr-2">
      <span class="todo-name">Task ${todoIndex}</span>
      <input type="datetime-local" class="ml-4 todo-date">
      <button class="ml-4 focus:outline-none toggle-button">
        <svg class="h-4 w-4 text-gray-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 9a1 1 0 0 1 2 0v3a1 1 0 0 1-1.7.7l-2.5-2.5a1 1 0 0 1 0-1.4L12 9zm-6-5a1 1 0 1 1 2 0v10a1 1 0 0 1-2 0V4zm11.3 8.3a1 1 0 0 1-1.4 1.4l-2.5-2.5a1 1 0 0 1 0-1.4l2.5-2.5a1 1 0 0 1 1.4 1.4L15.42 9l2.3 2.3z" clip-rule="evenodd" />
        </svg>
      </button>
       <button class="ml-2 focus:outline-none remove-button">
      <svg class="h-4 w-4 text-gray-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2V5zm3 9h2v2H8v-2zm0-6h2v4H8V8zm4 0h2v4h-2V8zm0 6h2v2h-2v-2z" clip-rule="evenodd" />
      </svg>
    </button>
    </div>
    <textarea class="hidden mt-2 ml-4 w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded toggle-textarea"></textarea>
    <div class="text-right">
      <small class="ml-2 text-gray-500 toggle-date hidden">Created ${createdDate}</small>
    </div>
  `;
  todoList.appendChild(li);
  todoIndex++;

  const toggleButton = li.querySelector(".toggle-button");
  const toggleTextarea = li.querySelector(".toggle-textarea");
  const todoName = li.querySelector(".todo-name");
  const todoDate = li.querySelector(".todo-date");
  const toggleDate = li.querySelector(".toggle-date");
  const checkbox = li.querySelector('input[type="checkbox"]');
  const removeButton = li.querySelector(".remove-button");

  toggleButton.addEventListener("click", () => {
    toggleTextarea.classList.toggle("hidden");
    toggleDate.classList.toggle("hidden");
    if (!toggleTextarea.classList.contains("hidden")) {
      toggleTextarea.style.height = toggleTextarea.scrollHeight + "px";
    }
  });

  todoName.addEventListener("dblclick", () => {
    todoName.contentEditable = true;
    todoName.focus();
  });

  todoName.addEventListener("blur", () => {
    todoName.contentEditable = false;
  });

  todoName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      todoName.blur();
    }
  });

  todoDate.addEventListener("change", () => {
    const currentDate = new Date();
    const taskDate = new Date(todoDate.value);
    const timeDiff = taskDate.getTime() - currentDate.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    if (hoursDiff <= 3 && hoursDiff > -3) {
      // Set alarm logic here (e.g., display a notification)
      alert(`Task '${todoName.textContent}' is due in less than 3 hours!`);
    }
  });

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      todoName.classList.add("line-through");
      const checkedDate = new Date().toLocaleString("en-US");
      toggleDate.textContent = `Finished ${checkedDate}, Created ${createdDate}`;
    } else {
      todoName.classList.remove("line-through");
      toggleDate.textContent = `Created ${createdDate}`;
    }
  });

  removeButton.addEventListener("click", () => {
    todoList.removeChild(li);
    todoIndex--;
  });
});
