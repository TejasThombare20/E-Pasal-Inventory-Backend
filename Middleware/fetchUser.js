const jwt = require("jsonwebtoken");
const JWT_SECRET = "line is to get the token";

const fetchUser = (req,res,next) =>
{
    // get the user from the JWT user and add id to req object
    const token = req.header("authtoken");
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }

    try {
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
    }

}
module.exports = fetchUser;