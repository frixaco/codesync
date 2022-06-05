import http, { Server } from "node:http";
import { performance } from "node:perf_hooks";
// import http2 from "node:http2";
// import EventEmitter from "node:events";
import { PORT } from "./config";
import { Router } from "./router";

export default class App {
    router: Router = {};

    constructor(router: Router) {
        // super();
        this.router = router;
    }

    init(cb: () => void) {
        try {
            const server = http.createServer(async (req, res) => {
                const { method = "GET", url = "/" } = req;
                const routeHandler = this.router[method][url];

                if (routeHandler) {
                    const result = await routeHandler(req, res);
                    switch (typeof result) {
                        case "object": {
                            res.writeHead(200, {
                                "Content-Type": "application/json",
                            }).end(JSON.stringify(result));
                            break;
                        }
                        case "string": {
                            res.end(result);
                            break;
                        }
                        default: {
                            throw new Error(`Unhandled route response`);
                            break;
                        }
                    }
                } else {
                    res.end("NOT FOUND");
                }
            });
            server.listen(PORT, cb);
        } catch (error) {
            throw new Error(`Couldn't start a server on port ${PORT}`);
        }
    }
}
