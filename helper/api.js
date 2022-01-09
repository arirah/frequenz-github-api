import axios from "axios"; 
 
const ENDPOINT = "https://api.github.com/search/repositories?sort=stars&order=desc&type=Organization";
const token = "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"; // Increase rate limit use token
axios.defaults.baseURL = ENDPOINT;
axios.defaults.timeout = 1000;
axios.defaults.headers.common = { 
Authorization: `Bearer ${token}` , 
'Access-Control-Allow-Origin' : '*',
'X-RateLimit-Reset': 1641635617,
'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS'}; 
export default axios;
