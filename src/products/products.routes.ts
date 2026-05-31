import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import { createProductSchema, listProductQuerySchema, updateProductSchema } from "./products.validators";
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct } from "./products.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listProductQuerySchema), listProducts);
router.get("/:id", getProductById);
router.post("/", validateBody(createProductSchema), createProduct);
router.patch("/:id", validateBody(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

export { router as productsRouter };
