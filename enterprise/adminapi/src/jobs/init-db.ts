import {sequelize} from "../storage/mysql";
import {QueryTypes} from "sequelize";
import {config} from "../config/config";

export const init_db = async () => { 
    await sequelize.query("create table if not exists user(\n" +
        "    id int unsigned auto_increment primary key,\n" +
        "    pid int not null default 0,\n" +
        "    path text not null,\n" +      
        "    status tinyint not null default 1,\n" +
        "    is_effective tinyint not null default 0,\n" +
        "    mch_id int not null default 0 ,\n" +
        "    openid varchar(38) unique not null default '',\n" +
        "    username varchar(50) unique not null default '',\n" +
        "    password char(32) not null default '',\n" +
        "    realname varchar(50) unique not null default '',\n" +
        "    mobile varchar(50) unique not null default '',\n" +
        "    create_time bigint not null default 0,\n" +
        "    avatarUrl varchar(250) not null default '',\n" +
        "    address varchar(50) not null default '',\n" +
        "    account  decimal(14,9) not null default 0.00, \n"+
        "    remark varchar(300) not null default '' \n" +
        ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //创建管理员表,role_id 1为超级管理员, mch_id 为部门id
    await sequelize.query("create table if not exists admin(\n" +
        "    id int not null primary key auto_increment,\n" +
        "    role_id int not null default 0,\n" +
        "    mch_id int not null default 0,\n" +
        "    username varchar(50) unique not null default '',\n" +
        "    password char(32) not null default '',\n" +
        "    realname varchar(50) unique not null default '',\n" +
        "    mobile varchar(50) unique not null default '',\n" +
        "    email varchar(50) unique not null default '',\n" +
        "    create_time bigint not null default 0,\n" +
        "    update_time bigint not null default 0,\n" +
        "    status int not null default 0\n" +
        ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //插入admin用户
    // await sequelize.query(`
    //     INSERT INTO admin (role_id, mch_id, username, password, realname, mobile, email, status) VALUES
    //     (1, 0, 'admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', '1234567890', 'superadmin@example.com', 1) 
    // `, { type: QueryTypes.INSERT });    
    //创建roles表 ,id,name,node(text类型),status
    await sequelize.query("create table if not exists roles(\n" +
        "    id int primary key auto_increment,\n" +
        "    name varchar(50) not null default '',\n" +
        "    nodes text ,\n" +
        "    status int not null default 0 \n" +
    ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //创建我喜欢的表
    await sequelize.query("create table if not exists favorite (\n" +
        "    id int primary key auto_increment,\n" +
        "    user_id int not null default 0,\n" +
        "    article_id int not null default 0,\n" +
        "    title varchar(250) not null default '',\n" +
        "    content text not null default '',\n" +
        "    addtime bigint not null default 0,\n" +
        "    source varchar(50) not null default '',\n" +
        "    sourceurl varchar(250) not null default '',\n" +
        "    create_time bigint not null default 0\n" +
        ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //插入一条默认规则 
    // await sequelize.query(`
    //     INSERT INTO roles (name, nodes, status) VALUES
    //     ('管理员组', 'admin,roles,branch,category,sysset,app', 1) 
    // `, { type: QueryTypes.INSERT });  
     //创建部门表 ，id,name,code,status create_time
    await sequelize.query("create table if not exists merchant(\n" +
        "    id int primary key auto_increment,\n" +
        "    name varchar(50) not null default '',\n" +
        "    code varchar(50) not null default '',\n" +
        "    address varchar(250) not null default '',\n" +
        "    private_key varchar(250) not null default '',\n" +
        "    status int not null default 0,\n" +
        "    ploys int not null default 0,\n" +
        "    price decimal(10,2) not null default 0,\n" +
        "    create_time bigint not null default 0\n" +
        ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //插入一条默认规则 
    // await sequelize.query(`
    //     INSERT INTO merchant (name, code, status) VALUES
    //     ('1号商户', '1001', 1) 
    // `, { type: QueryTypes.INSERT });  
    let year = 2024
    let month = 7
    // for (let i = 0; i < 48; i++) {
    //     //虚拟货币代币合约项目表
    //     await sequelize.query(`
    //         CREATE TABLE IF NOT EXISTS project_${year}_${month} ( 
    //     `, { type: QueryTypes.RAW });
         
    //     month += 1
    //     if (month > 12) {
    //         year += 1
    //         month = 1
    //     }
    // }
     
    // await sequelize.query("create table if not exists category(\n" +
    //     "    id int unsigned auto_increment primary key,\n" +
    //     "    status tinyint not null default 1,\n" +
    //     "    parent_id int not null default 0,\n" +
    //     "    cate_id int not null default 0,\n" +
    //     "    name varchar(50) not null default '',\n" +
    //     "    INDEX idx_cate_id (cate_id) \n"+
    //     ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
    //增加中间pid字段,用于查询,并且索引
    // await sequelize.query("create table if not exists platform(\n" +
    //     "    id int unsigned auto_increment primary key,\n" +
    //     "    status tinyint not null default 1,\n" +
    //     "    pid int not null default 0,\n" +
    //     "    name varchar(50) not null default '',\n" + 
    //     "    INDEX idx_pid (pid) \n"+
    //     ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW}) 
    //创建用户监听计划表，用于用户监听计划
    await sequelize.query(
    "CREATE TABLE IF NOT EXISTS user_plan (\n" +
    "  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,\n" +
    "  user_id BIGINT UNSIGNED NOT NULL,\n" +
    "  coin_name VARCHAR(64) NOT NULL,\n" +
    "  time_level VARCHAR(32) NOT NULL,\n" +
    "  structure_type VARCHAR(64) DEFAULT NULL,\n" +
    "  plan_direction VARCHAR(32) DEFAULT NULL,\n" +
    "  non_plan_direction VARCHAR(32) DEFAULT NULL,\n" +
    "  status TINYINT NOT NULL DEFAULT 0,\n" +
    "  create_at bigint not null default 0,\n" +
    "  KEY idx_user_id (user_id),\n" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;", 
    { type: QueryTypes.RAW }
    );

    for (let i = 0; i < config.USER_TRADE_TABLES; i++) {
        //虚拟货币代币合约项目表 profit：利润
        await sequelize.query(`
            create table if not exists token_${ i }(
                id int unsigned not null auto_increment primary key,
                status tinyint not null default 1,
                update_status tinyint not null default 1,
                mch_id int not null default 0,
                chain tinyint not null default 1,
                name varchar(250) not null default '',
                symbol varchar(250) not null default '',
                address_a varchar(250) not null default '',
                address_b varchar(250) not null default '',
                pool_id varchar(250) not null default '',
                supply decimal(30,10) not null default 0.00,
                decimals int not null default 0,
                init_price decimal(30,10) not null default 0.00,
                current_price decimal(30,10) not null default 0.00,               
                amount decimal(12,4) not null default 0.00,
                profit decimal(12,4) not null default 0.00, 
                create_time bigint not null default 0,
                update_time bigint not null default 0,
                add_time  timestamp not null default CURRENT_TIMESTAMP,
                INDEX idx_mch_id (mch_id),
                INDEX idx_update_time (update_time)
            )engine=innodb default charset=utf8mb4;
        `, { type: QueryTypes.RAW });
        //创建一个虚拟货币交易表，id,user_id,
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS trade_${i} (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                status TINYINT NOT NULL DEFAULT 1,
                mch_id int not null default 0,
                trade_id VARCHAR(100) NOT NULL UNIQUE,
                user_id VARCHAR(100) NOT NULL,
                base_currency VARCHAR(10) NOT NULL,
                quote_currency VARCHAR(10) NOT NULL,
                trade_type ENUM('buy', 'sell') NOT NULL,
                amount DECIMAL(18, 8) NOT NULL,
                price DECIMAL(18, 8) NOT NULL,
                total DECIMAL(18, 8) AS (amount * price) STORED,
                fee DECIMAL(18, 8) NOT NULL,
                fee_currency VARCHAR(10) NOT NULL,
                order_status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
                trade_time bigint not null default 0,
                update_time bigint not null default 0,
                platform_id INT NOT NULL DEFAULT 0,
                category_id INT NOT NULL DEFAULT 0,
                type_id INT NOT NULL DEFAULT 0,
                create_time INT NOT NULL DEFAULT 0,
                INDEX idx_mch_id (mch_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
        `, { type: QueryTypes.RAW });
    }
    
    /**
     *  创建日志表，日志状态，用户ID，日志内容，值val,process_id,remark,创建时间 log_type:1 分佣，2支付，3 提现，4余额，5积分，6代金券，7会员
    */
    // await sequelize.query("create table if not exists logs(\n" +
    //     "    id int unsigned auto_increment primary key,\n" +
    //     "    status tinyint not null default 0,\n" +
    //     "    log_type tinyint not null default 0 comment '1 ',\n" +
    //     "    user_id int not null default 0,\n" +
    //     "    content varchar(250) not null default '',\n" +
    //     "    val decimal(10,2) not null default 0.00,\n" +
    //     "    process_id tinyint not null default 0,\n" +
    //     "    remark varchar(500) not null default '',\n" +
    //     "    create_time bigint not null default 0\n" +
    //     ")engine=innodb default charset=utf8;",{type:QueryTypes.RAW})
     
    
    
}
