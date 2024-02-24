const http = require("node:http");
const { v4: uuidv4 } = require("uuid");
const errorHandler = require("./errorHandler");
const successHandler = require("./successHandler");

const todos = [];

const server = http.createServer((req, res) => {
  const { url, method } = req;
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  //查看
  if (url === "/todos" && method === "GET") {
    const message = {
      status: "success",
      data: todos,
    };
    successHandler(res, 200, message);

    //新增
  } else if (url === "/todos" && method === "POST") {
    req.on("end", () => {
      body = JSON.parse(body);
      const { title } = body;
      if (title !== undefined) {
        todos.push({
          title: title,
          id: uuidv4(),
        });
        const message = {
          status: "新增成功",
          data: todos,
        };
        successHandler(res, 200, message);
      } else {
        errorHandler(res, 400, "參數錯誤");
      }
    });

    //刪除全部
  } else if (url === "/todos" && method === "DELETE") {
    todos.length = 0;
    const message = {
      status: "刪除成功",
      data: todos,
    };
    successHandler(res, 200, message);

    //刪除單筆
  } else if (url.startsWith("/todos/") && method === "DELETE") {
    const id = url.split("/").pop();
    const index = todos.findIndex((item) => item.id === id);
    if (index === -1) {
      errorHandler(res, 400, "刪除失敗,找不到此id");
    } else {
      todos.splice(index, 1);
      const message = { message: "刪除成功", data: todos };
      successHandler(res, 200, message);
    }
  } else if (url.startsWith("/todos/") && method === "PATCH") {
    req.on("end", () => {
      body = JSON.parse(body);
      const { title } = body;
      const id = url.split("/").pop();
      const index = todos.findIndex((item) => item.id === id);
      if (index !== -1 && title != undefined) {
        todos[index].title = title;
        const message = {
          status: "編輯成功",
          data: todos,
        };
        successHandler(res, 200, message);
      } else {
        errorHandler(res, 400, "id不正確或是參數有錯誤");
      }
    });
  } //驗證
  else if (method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    errorHandler(res, 404, "找不到此路由");
  }
});

const hostname = "127.0.0.1";
const port = 3000;
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
