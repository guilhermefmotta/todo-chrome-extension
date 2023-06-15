(function () {
  class Todo {
    constructor(name, date, description) {
      this.name = name;
      this.date = date;
      this.checked = false;
      this.createdDate = new Date().toLocaleString("en-US");
      this.checkedDate = null;
      this.description = description;
    }
  }

  class TodoApp {
    constructor() {
      this.addTodoButton = document.getElementById("addTodoButton");
      this.todoList = document.getElementById("todoList");
      this.downloadButton = document.getElementById("downloadButton");
      this.uploadButton = document.getElementById("uploadButton");
      this.todoIndex = 1;
      this.todos = [];

      this.addTodoButton.addEventListener("click", this.addTodo.bind(this));
      this.downloadButton.addEventListener(
        "click",
        this.downloadTodos.bind(this)
      );
      this.uploadButton.addEventListener("change", this.uploadTodos.bind(this));

      this.loadTodosFromStorage();
    }

    createTodoElement(todo) {
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
        this.updateLocalStorage();
      });

      toggleTextarea.addEventListener("change", () => {
        todo.description = toggleTextarea.value;
        this.updateLocalStorage();
      });

      todoName.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          todoName.blur();
        }
      });

      todoDate.addEventListener("change", () => {
        todo.date = todoDate.value;
        console.log('change date',todo.date);
        if (this.isDueSoon(todoDate)) {
          todoName.classList.add("text-red-600");
        } else {
          todoName.classList.remove("text-red-600");
        }
        this.updateLocalStorage();
      });

      checkbox.addEventListener("change", () => {
        todo.checked = checkbox.checked;
        if (todo.checked) {
          todo.checkedDate = new Date().toLocaleString("en-US");
        } else {
          todo.checkedDate = null;
        }
        
        if (todo.checked) {
          todoName.classList.add("line-through");
          toggleDate.textContent = `Finished ${todo.checkedDate}, Created ${todo.createdDate}`;
        } else {
          todoName.classList.remove("line-through");
          toggleDate.textContent = `Created ${todo.createdDate}`;
        }
        this.updateLocalStorage();
      });

      removeButton.addEventListener("click", () => {
        li.remove();
        this.todos = this.todos.filter((t) => t !== todo);
        this.updateLocalStorage();
        this.checkDownloadButtonVisibility();
      });

      return li;
    }

    isDueSoon(todoDate) {
      const currentDate = new Date();
      const taskDate = new Date(todoDate.value);
      const timeDiff = Math.abs(taskDate.getTime() - currentDate.getTime());
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      console.log('hoursDiff', hoursDiff <= 3 && hoursDiff >= 0);
      console.log(hoursDiff)
      return hoursDiff === 3 || hoursDiff === 0;
    }

    addTodo() {
      const todo = new Todo(`Task ${this.todoIndex}`, "", "");
      this.todos.push(todo);

      const li = this.createTodoElement(todo);
      this.todoList.appendChild(li);
      this.todoIndex++;

      this.updateLocalStorage();
      this.checkDownloadButtonVisibility();
    }

    checkDownloadButtonVisibility() {
      this.downloadButton.classList.toggle(
        "hidden",
        this.todoList.childElementCount === 0
      );
    }

    updateLocalStorage() {
      console.log('update todos', this.todos);
      chrome.storage.sync.set({ todos: this.todos }, () => {
      });
    }

    loadTodosFromStorage() {
      chrome.storage.sync.get(["todos"], (result) => {
        const savedTodos = result.todos;
        if (savedTodos != null && savedTodos.length > 0) {
          this.todos = savedTodos;
          this.todos.forEach((todo) => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);

            const checkbox = li.querySelector('input[type="checkbox"]');
            const todoDate = li.querySelector(".todo-date");
            const todoName = li.querySelector(".todo-name");
            const toggleDate = li.querySelector(".toggle-date");
            const toggleTextarea = li.querySelector(".toggle-textarea");


            if (todo.checked) {
              checkbox.checked = todo.checked;
              todoName.classList.add("line-through");
              toggleDate.textContent = `Finished ${todo.checkedDate}, Created ${todo.createdDate}`;
            }

            todoDate.value = todo.date;
            toggleTextarea.value = todo.description;
          });

          this.checkDownloadButtonVisibility();
        }
      });
    }

    downloadTodos() {
      const jsonTodos = JSON.stringify(this.todos);
      const blob = new Blob([jsonTodos], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "todos.json";
      link.click();
      URL.revokeObjectURL(url);
    }

    uploadTodos(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const contents = e.target.result;
        try {
          this.todos = JSON.parse(contents);
          this.todoList.innerHTML = "";
          this.todoIndex = 1;
          this.todos.forEach((todo) => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);
            this.todoIndex++;
          });
          this.checkDownloadButtonVisibility();
        } catch (error) {
          console.error("Error parsing JSON file:", error);
        }
      };
      reader.readAsText(file);
    }
  }

  const app = new TodoApp();
})();
