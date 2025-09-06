// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title User Info
 * @notice 存储和管理众包平台用户信息的合约
 * @dev 使用mapping将钱包地址映射到用户个人信息
 */
contract UserInfo {
    // 自定义错误
    error UserInfo_EmptyName();

    // 用户技能更新事件
    event UserSkillsUpdated(address indexed user, string[] skills);

    // 用户基本信息更新事件
    event UserProfileUpdated(address indexed user, string name, string email, string bio, string website);

    /**
     * @notice 更新用户基本信息
     * @param name 用户姓名
     * @param email 用户邮箱
     * @param bio 用户简介
     * @param website 用户网站
     */
    function updateUserProfile(string memory name, string memory email, string memory bio, string memory website)
        external
    {
        if (bytes(name).length == 0) {
            revert UserInfo_EmptyName();
        }

        emit UserProfileUpdated(msg.sender, name, email, bio, website);
    }

    /**
     * @notice 更新用户技能
     * @param skills 用户技能列表
     */
    function updateUserSkills(string[] memory skills) external {
        emit UserSkillsUpdated(msg.sender, skills);
    }
}
