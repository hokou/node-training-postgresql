require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

const isValidString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
}

// 可增加其他檢查: 例如正整數
const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
}


const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const data = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
        data: data
      }))
      res.end()
    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤",
      }))
      res.end()
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const {name, credit_amount, price} = JSON.parse(body);
        
        if (!isValidString(name) || !isNumber(credit_amount) || !isNumber(price)) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確",
          }))
          res.end()
          return
        }

        const creditPackage = AppDataSource.getRepository("CreditPackage")
        const isExist = await creditPackage.findOne({
          where: {
            name: name
          }
        })
        if (isExist) {
          res.writeHead(409, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複",
          }))
          res.end()
          return
        }

        const newCreditPackage = creditPackage.create({
          name,
          credit_amount,
          price
        })

        const result = await creditPackage.save(newCreditPackage)

        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()

      } catch (error) {
        res.writeHead(500, headers)
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤",
        }))
        res.end()
      }
    })
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      const creditPackageId = req.url.split("/").pop();
  
      if (!isValidString(creditPackageId)) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤",
        }))
        res.end()
        return
      }
  
      const result = await AppDataSource.getRepository("CreditPackage").delete(creditPackageId);
      if (result.affected === 0) {
        res.writeHead(404, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤",
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
      }))
      res.end()

    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤",
      }))
      res.end()
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由",
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
