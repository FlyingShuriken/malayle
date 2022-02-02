// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import apiKey from "./apiKey";

export default function handler(req, res) {
  const { word } = req.query;
  const headers = {
    "Authorization": "Token " + apiKey,
  }
  fetch(`https://owlbot.info/api/v4/dictionary/${word}`, {
    headers: headers
  })
    .then((resp) => resp.status)
    .then(data => {
      res.status(200).json({ code: data }
      )
    })
} 