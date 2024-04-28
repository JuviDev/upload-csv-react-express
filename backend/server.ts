import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";

const app = express();
const port = process.env.PORT ?? 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors()); // Enable CORS

let userData: Array<Record<string, string>> = [];

app.post("/api/files", upload.single("file"), async (req, res) => {
  // 1. Extract the file from the request
  const { file } = req;
  // 2. Validate that we have file
  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  // 3. Validate the mimetype (csv)
  if (file.mimetype !== "text/csv") {
    return res
      .status(500)
      .json({ message: "Invalid file type. Please upload a CSV file." });
  }
  // 4. Transform the File (Buffer) to String
  let json: Array<Record<string, string>> = [];
  try {
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    // 5. Transform string (csv) to JSON
    json = csvToJson.fieldDelimiter(",").csvStringToJson(rawCsv);
  } catch (error) {
    return res.status(500).json({ message: "Error parsing the CSV file." });
  }

  // 6. Save the JSON to db (or in memory)
  userData = json;

  // 7. Return a success message
  res.status(200).json({ data: json, message: "File uploaded successfully." });
});

app.get("/api/users", async (req, res) => {
  // 1. Extract the query param 'q' from the request
  const { q } = req.query;
  // 2. Validate that we have a query param
  if (!q) {
    return res.status(400).json({ message: "No query parameter provided." });
  }

  const search = q.toString().toLowerCase();

  // 3. Filter the data based on the query param
  const filteredData = userData.filter((row) => {
    return Object.values(row).some((value) =>
      value.toLowerCase().includes(search)
    );
  });

  // 4. Return the filtered data
  res.status(200).json({ data: filteredData });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
