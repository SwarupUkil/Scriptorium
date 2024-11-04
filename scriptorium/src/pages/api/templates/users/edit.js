import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";

// Handler will update the clients templates with specified values.
async function handler(req, res) {

}

export default verifyTokenMiddleware(handler, "USERS");