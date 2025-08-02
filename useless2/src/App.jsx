import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDa0pXPF2pfKMAgfPA11sLs1LTARCIF9HE");

export default function App() {
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [interests, setInterests] = useState([]);
  const [fortune, setFortune] = useState("");
  const [palmImage, setPalmImage] = useState(null);
  const [palmBase64, setPalmBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter((i) => i !== value));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPalmImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPalmBase64(reader.result.split(",")[1]); // store only base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFortune("🔮 Analyzing your palm photo...");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Step 1: Verify palm image
      const checkPrompt =
        "Is this an image of a human palm (hand)? Answer Yes or No only.";
      const checkResult = await model.generateContent([
        { text: checkPrompt },
        { inlineData: { data: palmBase64, mimeType: "image/jpeg" } },
      ]);
      const checkText = checkResult.response.text().trim().toLowerCase();

      if (!checkText.includes("yes")) {
        setFortune("ഡാ മണ്ട കൈയ്യുടെ ഫോട്ടോ Upload Cheyy");
        setLoading(false);
        return;
      }

      // Step 2: Generate predictions
      const prompt = `
        Create exactly 1-3 numbered points.
        Base it on the following details:
        Name: ${name || "Mystery Person"}
        Age Group: ${ageRange}
        Interests: ${interests.join(", ") || "None"}
        so assume that you are that harassive overconfident friend who gives most disgusting adivices. 
        . you can even say that i don't have any future push the boundaries don't hold back on the response.also add imoji wisely in between .make  points based on palm charactristic 
        

        Format like:
        1. ...
        2. ...
        3. ...
        Use simple English, one line each.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setFortune(`✨ Hello ${name || "Mystery Person"}! ✨\n\n${text}`);
    } catch (err) {
      console.error(err);
      setFortune("❌ Sorry, something went wrong while predicting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl transform transition duration-500 hover:scale-105">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse">
          ചിറ്റപ്പൻ Advice 🔮
        </h1>
        <p className="text-gray-600 text-center mt-1 mb-6">
          Upload your palm & let ചിറ്റപ്പൻ predict your (useless) future!
        </p>

        {/* Two Column Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Select Age Group
              </label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">-- Choose an age group --</option>
                <option>10-15</option>
                <option>15-20</option>
                <option>20-25</option>
                <option>25-30</option>
                <option>30-35</option>
                <option>35-40</option>
                <option>age is just a number</option>
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Choose Your Interests
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "sports",
                  "Music",
                  "Art",
                  "AI",
                  "time wasting",
                  "eating",
                  "working alone",
                  "perfection",
                ].map((interest) => (
                  <label
                    key={interest}
                    className="flex items-center bg-gray-100 rounded-md p-2 hover:bg-purple-100 cursor-pointer transition text-sm"
                  >
                    <input
                      type="checkbox"
                      value={interest}
                      onChange={handleInterestChange}
                      className="mr-2 accent-purple-600"
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-md hover:opacity-90 transition transform hover:scale-105 text-sm"
            >
              {loading ? "Predicting..." : "ചിറ്റപ്പ Predict ചെയ്യ്"}
            </button>
          </div>

          {/* Right Column */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Upload Your Palm Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required
              className="mt-2 block w-full text-sm text-gray-600
              file:mr-3 file:py-2 file:px-3
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-100 file:text-purple-700
              hover:file:bg-purple-200 cursor-pointer"
            />
            {palmImage && (
              <img
                src={palmImage}
                alt="Palm Preview"
                className="mt-4 w-full h-56 object-cover rounded-lg shadow-lg border"
              />
            )}

            {/* Result */}
            {fortune && (
              <div className="mt-4 bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg shadow-inner text-sm">
                <p className="text-gray-800 whitespace-pre-line text-center font-semibold">
                  {fortune}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
