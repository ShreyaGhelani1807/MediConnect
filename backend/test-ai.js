require('dotenv').config();
const { aiChat } = require('./services/aiService');

async function test() {
  try {
    const history = [{ role: 'user', content: "I've had a dull chest ache for 3 days, sometimes radiating to my left arm. I feel breathless when climbing stairs." }];
    console.log("Testing aiChat...");
    const res = await aiChat(history, 45, 'Mumbai', false);
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error occurred:", err);
  }
}
test();
