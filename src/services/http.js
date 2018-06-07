import request from "superagent";

export class Http {

  constructor() {
  }

  static post(url, body) {
    return request
   .post(url)
   .send(body)
   .set('Content-Type', 'application/json')
   .set('Accept', 'application/json')
   .then(function(res) {
      return JSON.stringify(res.body);
   }).catch((e) => {
      throw new Error(e);
   });
  }

  static get(url) {
    return request
   .get(url)
   .set('Content-Type', 'application/json')
   .set('Accept', 'application/json')
   .then(function(res) {
      return res.body;
   }).catch((e) => {
      throw new Error(e);
   });
  }
}