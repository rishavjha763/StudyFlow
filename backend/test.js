const mongoose = require("mongoose");

const uri =
  "mongodb+srv://jharishav763:rishavjha%402004@cluster0.0vtrryz.mongodb.net/studyflow?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FULL ERROR:");
    console.error(err);
    process.exit(1);
  });
