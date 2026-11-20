export const Enlangs = {
    // Basic operations
    success: "Operation successful",
    failure: "Operation failed",
    unauthorized: "Unauthorized access",
    forbidden: "Access denied",
    validation_error: "Invalid request parameters",
    token_refresh_failed: "Token refresh failed",
    token_missing: "Access token is missing",
    token_invalid: "Access token is invalid or expired",
    
    // Login related
    login_success: "Login successful",
    login_failed: "Incorrect username or password",
    logout_success: "Logged out successfully",
    err_salt: "Salt value error",
    
    // Password related
    change_password_success: "Password changed successfully",
    change_password_failed: "Failed to change password",
    password_error: "Old password is incorrect",
    password_too_short: "Password must be at least 6 characters",
    password_format_error: "Password format is incorrect",
    
    // User related
    user_created: "User created successfully",
    user_exists: "User already exists",
    user_not_found: "User not found",
    user_state: "User state is abnormal",
    user_disabled: "User has been disabled",
    user_locked: "User has been locked",
    
    // Data operations
    no_data: "No data",
    add_success: "Added successfully",
    delete_success: "Deleted successfully",
    update_success: "Updated successfully",
    data_error: "Data parsing error",
    server_error: "Internal server error",
    repeat_submit: "Please do not submit repeatedly",
    not_found: "Resource not found",
    insert_error: "Insert failed",
    update_error: "Update failed",
    delete_error: "Delete failed",
    
    // Audit related
    audit_error: "Audit failed",
    audit_success: "Audit successful",
    audit_pending: "Under review",
    audit_rejected: "Audit rejected",
    
    // Status related
    toggle_status_error: "Toggle status failed",
    status_update_success: "Status updated successfully",
    status_invalid: "Invalid status value",
    
    // List queries
    get_list_error: "Failed to get list",
    get_detail_error: "Failed to get details",
    get_my_list_error: "Failed to get my services",
    get_favorite_list_error: "Failed to get favorite list",
    
    // SMS verification code related
    sms_send_success: "Verification code sent successfully",
    sms_send_failed: "Failed to send verification code",
    sms_code_invalid: "Verification code is incorrect",
    sms_code_expired: "Verification code has expired",
    sms_code_required: "Please enter verification code",
    sms_rate_limit: "Too frequent, please try again later",
    sms_phone_invalid: "Invalid phone number format",
    
    // Registration related
    register_success: "Registration successful",
    register_failed: "Registration failed",
    company_name_required: "Company name cannot be empty",
    username_required: "Username cannot be empty",
    username_exists: "Username already exists",
    mobile_required: "Mobile number cannot be empty",
    mobile_invalid: "Please enter a valid mobile number",
    mobile_exists: "Mobile number already registered",
    role_type_required: "Role type cannot be empty",
    role_type_invalid: "Role type must be a number",
    
    // Address related
    province_required: "Province cannot be empty",
    province_invalid: "Province must be a number",
    city_required: "City cannot be empty",
    city_invalid: "City must be a number",
    district_required: "District cannot be empty",
    district_invalid: "District must be a number",
    town_required: "Town cannot be empty",
    town_invalid: "Town must be a number",
    
    // Product related
    product_create_success: "Product created successfully",
    product_create_failed: "Product creation failed",
    product_update_success: "Product updated successfully",
    product_update_failed: "Product update failed",
    product_delete_success: "Product deleted successfully",
    product_delete_failed: "Product deletion failed",
    product_not_found: "Product not found",
    product_name_required: "Product name cannot be empty",
    product_price_invalid: "Product price format error",
    product_category_required: "Product category cannot be empty",
    
    // Order related
    order_create_success: "Order created successfully",
    order_create_failed: "Order creation failed",
    order_pay_success: "Payment successful",
    order_pay_failed: "Payment failed",
    order_not_found: "Order not found",
    order_status_invalid: "Invalid order status",
    order_amount_invalid: "Order amount error",
    
    // WeChat related
    weixin_token_failed: "Failed to get WeChat token",
    weixin_qrcode_failed: "Failed to generate QR code",
    weixin_pay_failed: "WeChat payment failed",
    weixin_openid_failed: "Failed to get openid",
    
    // File upload
    file_upload_success: "File uploaded successfully",
    file_upload_failed: "File upload failed",
    file_too_large: "File size exceeds limit",
    file_type_invalid: "File type not supported",
    file_required: "Please select a file to upload",
    
    // Network related
    network_error: "Network connection failed",
    timeout_error: "Request timeout",
    service_unavailable: "Service temporarily unavailable",
    
    // Permission related
    permission_denied: "Insufficient permissions",
    admin_required: "Admin privileges required",
    login_required: "Please login first",
    
    // Business related
    business_error: "Business logic error",
    data_integrity_error: "Data integrity error",
    duplicate_entry: "Duplicate data",
    invalid_operation: "Invalid operation",
    
    // System related
    system_busy: "System busy, please try again later",
    maintenance_mode: "System under maintenance",
    version_mismatch: "Version mismatch",
    
    // Captcha related
    captcha_required: "Please enter verification code",
    captcha_invalid: "Verification code is incorrect",
    captcha_expired: "Verification code has expired",
    
    // Others
    operation_cancelled: "Operation cancelled",
    operation_timeout: "Operation timeout",
    resource_busy: "Resource is busy",
    quota_exceeded: "Quota exceeded",
    
    // List related
    no_data_found: "No data found",
    invalid_page: "Invalid page number",
    invalid_page_size: "Invalid page size",
    list_empty: "List is empty",
    list_too_large: "List data too large",
    
    // Search related
    search_failed: "Search failed",
    no_search_results: "No search results found",
    invalid_search_keyword: "Invalid search keyword",
    search_keyword_too_short: "Search keyword too short",
    search_timeout: "Search timeout",
    
    // Enterprise related
    query_enterprise_failed: "Failed to query enterprise list",
    no_enterprise_found: "No enterprise information found",
    enterprise_not_found: "Enterprise not found",
    get_enterprise_detail_failed: "Failed to get enterprise details",
    query_count_failed: "Failed to query enterprise count",
    review_success: "Review successful",
    review_failed: "Review failed",
    invalid_review_status: "Invalid review status",
    already_reviewed: "Enterprise already reviewed",
    company_exists: "Company already exists",
    enterprise_name_required: "Enterprise name is required",
    address_invalid: "Invalid address information",
    
    // Association add
    association_add_success: "Association added successfully",
    association_add_failed: "Failed to add association",
    
    // Type query
    query_type_failed: "Failed to query types",
    no_types_found: "No type information found",
    query_type_tag_failed: "Failed to query type tags",
    no_tags_found: "No tag information found",
    
    // Role related
    role_invalid: "Invalid role type",
    
    // Statistics related
    get_statistics_failed: "Failed to get statistics",
    
    // Update related
    user_update_success: "User updated successfully",
    user_update_failed: "Failed to update user",
    user_get_detail_error: "Failed to get user details",
    update_failed: "Update failed",

}

export const GetEnLang = (lang: string) => {
    return Enlangs[lang]
}