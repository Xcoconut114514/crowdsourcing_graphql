import {
  UserProfileUpdated as UserProfileUpdatedEvent,
  UserSkillsUpdated as UserSkillsUpdatedEvent,
} from "../generated/UserInfo/UserInfo";
import { User, UserProfile, UserSkills } from "../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

// 获取或创建User实体的辅助函数
function getOrCreateUser(address: string): User {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.address = Bytes.fromHexString(address);
    user.save();
  }
  return user as User;
}

export function handleUserProfileUpdated(event: UserProfileUpdatedEvent): void {
  // 获取或创建用户实体
  let userId = event.params.user.toHexString();
  let user = getOrCreateUser(userId);

  // 加载或创建用户资料实体
  let profileId = userId + "-profile";
  let profile = UserProfile.load(profileId);
  if (!profile) {
    profile = new UserProfile(profileId);
    profile.user = userId;
    profile.createdAt = event.block.timestamp;
  }

  profile.name = event.params.name;
  profile.email = event.params.email;
  profile.bio = event.params.bio;
  profile.website = event.params.website;
  profile.updatedAt = event.block.timestamp;
  profile.save();

  // 关联用户和资料
  user.profile = profileId;
  user.save();
}

export function handleUserSkillsUpdated(event: UserSkillsUpdatedEvent): void {
  // 获取或创建用户实体
  let userId = event.params.user.toHexString();
  let user = getOrCreateUser(userId);

  // 加载或创建用户技能实体
  let skillsId = userId + "-skills";
  let skills = UserSkills.load(skillsId);
  if (!skills) {
    skills = new UserSkills(skillsId);
    skills.user = userId;
    skills.createdAt = event.block.timestamp;
  }

  skills.skills = event.params.skills;
  skills.updatedAt = event.block.timestamp;
  skills.save();

  // 关联用户和技能
  user.skills = skillsId;
  user.save();
}