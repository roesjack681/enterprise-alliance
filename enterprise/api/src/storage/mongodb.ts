import mongoose, { Connection, Model, Schema, Document } from 'mongoose';
import { config } from '../config/config';

// 连接池和集群配置
const mongoUri = config.MONGODB_URI;
const mongoUser = config.MONGODB_USER;
const mongoPass = config.MONGODB_PASS;

// 支持副本集/集群连接字符串，连接池参数可根据需要调整
const options: mongoose.ConnectOptions = {
    user: mongoUser,
    pass: mongoPass,
    maxPoolSize: 20, // 连接池最大连接数
    minPoolSize: 5,  // 连接池最小连接数
    // replicaSet: 'yourReplicaSetName', // 如有副本集可加此项
};

mongoose.connect(mongoUri, options)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
    // mongoose.connection.on('connected', () => {
    //     console.log('A new connection from the pool is established');
    //   });
export interface BaseDoc extends Document {
    createdAt?: Date;
    updatedAt?: Date;
}

// 通用CRUD操作封装
export class MongoBase<T extends BaseDoc> {
    private model: Model<T>;
    constructor(modelName: string, schema: Schema<T>) {
        this.model = mongoose.model<T>(modelName, schema);
    }

    async create(doc: Partial<T>) {
        return this.model.create(doc);
    }

    async findOne(query: any, projection?: any) {
        return this.model.findOne(query, projection).exec();
    }

    async find(query: any, projection?: any, options?: any) {
        return this.model.find(query, projection, options).exec();
    }

    async updateOne(query: any, update: any, options?: any) {
        return this.model.updateOne(query, update, options).exec();
    }

    async updateMany(query: any, update: any, options?: any) {
        return this.model.updateMany(query, update, options).exec();
    }

    async deleteOne(query: any) {
        return this.model.deleteOne(query).exec();
    }

    async deleteMany(query: any) {
        return this.model.deleteMany(query).exec();
    }

    async count(query: any) {
        return this.model.countDocuments(query).exec();
    }
}

// 用法示例：
// const userSchema = new Schema({ name: String, age: Number }, { timestamps: true });
// const UserModel = new MongoBase('User', userSchema);
// await UserModel.create({ name: 'Tom', age: 18 }); 