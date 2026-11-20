export const Zhlangs = {
        // 基础操作
    success: "操作成功",
    failure: "操作失败",
    unauthorized: "未授权访问",
    forbidden: "禁止访问",
    validation_error: "请求参数错误",
    token_refresh_failed: "Token刷新失败",
    token_missing: "缺少访问令牌",
    token_invalid: "访问令牌无效或已过期",
    
    // 登录相关
    login_success: "登录成功",
    login_failed: "用户名或密码错误",
    logout_success: "退出成功",
    err_salt: "盐值错误",
    
    // 密码相关
    change_password_success: "修改密码成功",
    change_password_failed: "修改密码失败",
    password_error: "旧密码错误",
    password_too_short: "密码长度至少6位",
    password_format_error: "密码格式不正确",
    
    // 用户相关
    user_created: "用户创建成功",
    user_exists: "用户已存在",
    user_not_found: "用户不存在",
    user_state: "用户状态异常",
    user_disabled: "用户已被禁用",
    user_locked: "用户已被锁定",
    
    // 数据操作
    no_data: "无数据",
    add_success: "添加成功",
    delete_success: "删除成功",
    update_success: "更新成功",
    data_error: "数据解析错误",
    server_error: "服务器内部错误",
    repeat_submit: "请勿重复提交",
    not_found: "未找到相关数据",
    insert_error: "新增失败",
    update_error: "更新失败",
    delete_error: "删除失败",
    
    // 审核相关
    audit_error: "审核失败",
    audit_success: "审核成功",
    audit_pending: "审核中",
    audit_rejected: "审核被拒绝",
    
    // 状态相关
    toggle_status_error: "切换状态失败",
    status_update_success: "状态更新成功",
    status_invalid: "状态值无效",
    
    // 列表查询
    get_list_error: "获取列表失败",
    get_detail_error: "获取详情失败",
    get_my_list_error: "获取我的服务失败",
    get_favorite_list_error: "获取收藏列表失败",
    
    // 短信验证码相关
    sms_send_success: "验证码发送成功",
    sms_send_failed: "验证码发送失败",
    sms_code_invalid: "验证码错误",
    sms_code_expired: "验证码已过期",
    sms_code_required: "请输入验证码",
    sms_rate_limit: "发送过于频繁，请稍后再试",
    sms_phone_invalid: "手机号格式不正确",
    
    // 注册相关
    register_success: "注册成功",
    register_failed: "注册失败",
    company_name_required: "公司名称不能为空",
    username_required: "用户名不能为空",
    username_exists: "用户名已存在",
    mobile_required: "手机号不能为空",
    mobile_invalid: "请输入正确的手机号",
    mobile_exists: "手机号已被注册",
    role_type_required: "角色类型不能为空",
    role_type_invalid: "角色类型必须是数字",
    
    // 地址相关
    province_required: "省份不能为空",
    province_invalid: "省份必须是数字",
    city_required: "城市不能为空",
    city_invalid: "城市必须是数字",
    district_required: "区县不能为空",
    district_invalid: "区县必须是数字",
    town_required: "乡镇不能为空",
    town_invalid: "乡镇必须是数字",
    
    // 产品相关
    product_create_success: "产品创建成功",
    product_create_failed: "产品创建失败",
    product_update_success: "产品更新成功",
    product_update_failed: "产品更新失败",
    product_delete_success: "产品删除成功",
    product_delete_failed: "产品删除失败",
    product_not_found: "产品不存在",
    product_name_required: "产品名称不能为空",
    product_price_invalid: "产品价格格式错误",
    product_category_required: "产品分类不能为空",
    
    // 订单相关
    order_create_success: "订单创建成功",
    order_create_failed: "订单创建失败",
    order_pay_success: "支付成功",
    order_pay_failed: "支付失败",
    order_not_found: "订单不存在",
    order_status_invalid: "订单状态无效",
    order_amount_invalid: "订单金额错误",
    
    // 微信相关
    weixin_token_failed: "获取微信token失败",
    weixin_qrcode_failed: "生成二维码失败",
    weixin_pay_failed: "微信支付失败",
    weixin_openid_failed: "获取openid失败",
    
    // 文件上传
    file_upload_success: "文件上传成功",
    file_upload_failed: "文件上传失败",
    file_too_large: "文件大小超出限制",
    file_type_invalid: "文件类型不支持",
    file_required: "请选择要上传的文件",
    
    // 网络相关
    network_connection_failed: "网络连接失败",
    request_timeout: "请求超时",
    service_unavailable: "服务暂时不可用",
    
    // 权限相关
    permission_denied: "权限不足",
    admin_required: "需要管理员权限",
    login_required: "请先登录",
    
    // 业务相关
    business_error: "业务逻辑错误",
    data_integrity_error: "数据完整性错误",
    duplicate_entry: "数据重复",
    invalid_operation: "无效操作",
    
    // 系统相关
    system_busy: "系统繁忙，请稍后重试",
    maintenance_mode: "系统维护中",
    version_mismatch: "版本不匹配",
    
    // 验证码相关
    captcha_required: "请输入验证码",
    captcha_invalid: "验证码错误",
    captcha_expired: "验证码已过期",
    
    // 其他
    operation_cancelled: "操作已取消",
    operation_timeout: "操作超时",
    resource_busy: "资源被占用",
    quota_exceeded: "配额已用完",
    
    // 列表相关
    no_data_found: "暂无数据",
    invalid_page: "页码无效",
    invalid_page_size: "每页数量无效",
    list_empty: "列表为空",
    list_too_large: "列表数据过多",
    
    // 搜索相关
    search_failed: "搜索失败",
    no_search_results: "未找到相关结果",
    invalid_search_keyword: "搜索关键词无效",
    search_keyword_too_short: "搜索关键词太短",
    search_timeout: "搜索超时",
    
    // 企业相关
    query_enterprise_failed: "查询企业列表失败",
    no_enterprise_found: "未找到企业信息",
    enterprise_not_found: "企业不存在",
    get_enterprise_detail_failed: "获取企业详情失败",
    query_count_failed: "查询企业数量失败",
    review_success: "审核成功",
    review_failed: "审核失败",
    invalid_review_status: "审核状态无效",
    already_reviewed: "该企业已审核",
    company_exists: "企业已存在",
    enterprise_name_required: "企业名称不能为空",
    address_invalid: "地址信息无效",
    
    // 关联添加
    association_add_success: "关联添加成功",
    association_add_failed: "关联添加失败",
    
    // 类型查询
    query_type_failed: "查询类型失败",
    no_types_found: "未找到类型信息",
    query_type_tag_failed: "查询类型标签失败",
    no_tags_found: "未找到标签信息",
    
    // 角色相关
    role_invalid: "角色类型无效",
    
    // 统计相关
    get_statistics_failed: "获取统计信息失败",
    
    // 更新相关
    user_update_success: "用户更新成功",
    user_update_failed: "用户更新失败",
    user_get_detail_error: "获取用户详情失败",
    update_failed: "更新失败",
    
    // 经纪人模块相关
    contact_status_pending: "待沟通",
    contact_status_contacted: "已沟通", 
    contact_status_following: "跟进中",
    contact_status_success: "成交",
    contact_status_invalid: "失效",
    contact_not_found: "联系记录不存在",
    invalid_status: "联系状态值不正确",
    no_update_fields: "没有需要更新的字段",
    need_not_found: "需求不存在",
    contact_exists: "已联系过该企业",
    
}

export const GetZhLang = (lang: string) => {
    return Zhlangs[lang]
}