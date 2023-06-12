(function () {
  class Todo {
    constructor(name, date) {
      this.name = name;
      this.date = date;
      this.checked = false;
      this.createdDate = new Date().toLocaleString("en-US");
      this.checkedDate = null;
    }

    

    
  }

  const addTodoButton = document.getElementById("addTodoButton");
  const todoList = document.getElementById("todoList");
  const downloadButton = document.getElementById("downloadButton");
  const uploadButton = document.getElementById("uploadButton");
  let todoIndex = 1;
  let todos = [];

  function toggleChecked(todo) {
    todo.checked = !todo.checked;
    if (todo.checked) {
      todo.checkedDate = new Date().toLocaleString("en-US");
    } else {
      todo.checkedDate = null;
    }
  }

  function isDueSoon(todo) {
      const currentDate = new Date();
      const taskDate = new Date(todo.date);
      const timeDiff = taskDate.getTime() - currentDate.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      return hoursDiff <= 3 && hoursDiff > -3;
    }

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "mb-2 relative";
    const createdDate = new Date().toLocaleString("en-US");

    li.innerHTML = `
    <div class="flex items-center w-full justify-between">
    <div>
      <input type="checkbox" class="mr-2">
      <span class="todo-name">${todo.name}</span>
    </div>
      <div class="flex justify-end">
        <input type="datetime-local" class="ml-4 todo-date">
        <button id="arrowButton" class="ml-4 focus:outline-none toggle-button">
        </button>
        <button id="removeButton" class="ml-4 focus:outline-none remove-button">
        </button>
      </div>
    </div>
    <div class="mr-4">
      <textarea class="hidden mt-2 ml-4 w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded toggle-textarea"></textarea>
      <div class="text-right">
        <small class="ml-2 text-gray-500 toggle-date hidden">Created ${createdDate}</small>
      </div>
    </div>
  `;

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
        toggleTextarea.style.height = "100px";
      }
    });

    todoName.addEventListener("dblclick", () => {
      todoName.contentEditable = true;
      todoName.focus();
    });

    todoName.addEventListener("blur", () => {
      todoName.contentEditable = false;
      todo.name = todoName.textContent.trim();
      updateLocalStorage();
    });

    todoName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        todoName.blur();
      }
    });

    todoDate.addEventListener("change", () => {
      todo.date = todoDate.value;
      updateLocalStorage();
      if (isDueSoon(todo)) {
        todoName.classList.add("bg-red");
      } else {
        todoName.classList.remove("bg-red");
      }
    });

    checkbox.addEventListener("change", () => {
      toggleChecked(todo);
      if (checkbox.checked) {
        todoName.classList.add("line-through");
        toggleDate.textContent = `Finished ${todo.checkedDate}, Created ${todo.createdDate}`;
      } else {
        todoName.classList.remove("line-through");
        toggleDate.textContent = `Created ${todo.createdDate}`;
      }
      updateLocalStorage();
    });

    removeButton.addEventListener("click", () => {
      li.remove();
      todos = todos.filter((t) => t !== todo);
      updateLocalStorage();
      checkDownloadButtonVisibility();
    });

    return li;
  }

  function addTodo() {
    const todo = new Todo(`Task ${todoIndex}`, "");
    todos.push(todo);

    const li = createTodoElement(todo);
    todoList.appendChild(li);
    todoIndex++;

    updateLocalStorage();
    checkDownloadButtonVisibility();
  }

  addTodoButton.addEventListener("click", addTodo);

  function checkDownloadButtonVisibility() {
    downloadButton.classList.toggle("hidden", todoList.childElementCount === 0);
  }

  function updateLocalStorage() {
    chrome.storage.sync.set({ todos: todos }, () => {
      console.log("Data stored");
    });
  }

  function loadTodosFromStorage() {
    chrome.storage.sync.get(["todos"], (result) => {
      const savedTodos = result.todos;
      if (savedTodos) {
        todos = savedTodos;
        todos.forEach((todo) => {
          const li = createTodoElement(todo);
          todoList.appendChild(li);

          const checkbox = li.querySelector('input[type="checkbox"]');
          const todoDate = li.querySelector(".todo-date");
          const toggleDate = li.querySelector(".toggle-date");

          if (todo.checked) {
            checkbox.checked = true;
            todoName.classList.add("line-through");
            toggleDate.textContent = `Finished ${todo.checkedDate}, Created ${todo.createdDate}`;
          }

          todoDate.value = todo.date;
        });

        checkDownloadButtonVisibility();
      }
    });
  }

  loadTodosFromStorage();

  downloadButton.addEventListener("click", () => {
    const jsonTodos = JSON.stringify(todos);
    const blob = new Blob([jsonTodos], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "todos.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  uploadButton.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;
      try {
        todos = JSON.parse(contents);
        todoList.innerHTML = "";
        todoIndex = 1;
        todos.forEach((todo) => {
          const li = createTodoElement(todo);
          todoList.appendChild(li);
          todoIndex++;
        });
        checkDownloadButtonVisibility();
      } catch (error) {
        console.error("Error parsing JSON file:", error);
      }
    };
    reader.readAsText(file);
  });
})();
