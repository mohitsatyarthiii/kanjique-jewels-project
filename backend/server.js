import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/adminProductRoutes.js";
import productsRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import ordersRoutes from './routes/ordersRoutes.js'
import userOrdersRoutes from "./routes/userOrdersRoutes.js"; 
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { connectDB} from './config/db.js'


dotenv.config();
const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://kanjique-jewels-project-2.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/products", productsRoutes);
app.use( cartRoutes);
app.use("/api/orders", orderRoutes)
app.use("/api/admin/orders", adminOrderRoutes);
app.use(checkoutRoutes)
app.use(profileRoutes)
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/user/orders", userOrdersRoutes); //
app.use("/api", locationRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));
