import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
});

await connection.execute("DROP DATABASE IF EXISTS simpbb_neo");
await connection.execute("CREATE DATABASE simpbb_neo");
console.log("✅ Database dropped and recreated successfully!");

await connection.end();
