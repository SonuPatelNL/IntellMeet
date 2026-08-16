/*
  Seed script for IntellMeet demo environment.
  Run from repository root using: pnpm --filter server run seed
  or from apps/server: pnpm run seed (configured in apps/server/package.json)
*/

import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { env } from '../apps/server/src/config/env';
import { User } from '../apps/server/src/modules/users/user.model';
import Workspace from '../apps/server/src/modules/workspace/workspace.model';
import Meeting from '../apps/server/src/modules/meetings/meeting.model';
import Message from '../apps/server/src/modules/chat/message.model';
import Task from '../apps/server/src/modules/tasks/task.model';

async function connect() {
  await mongoose.connect(env.mongoUri, { maxPoolSize: 10 });
}

function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function createUsers(n = 10) {
  const users = [] as any[];
  for (let i = 0; i < n; i++) {
    const u = new User({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: i === 0 ? 'admin' : i < 3 ? 'manager' : 'member',
      status: 'active',
    } as any);
    u.setPassword('Password123!');
    await u.save();
    users.push(u);
  }
  return users;
}

async function createWorkspaces(n = 5, users: any[]) {
  const wspaces = [] as any[];
  for (let i = 0; i < n; i++) {
    const owner = randomPick(users);
    const members = users
      .slice(i, i + 5)
      .map((user) => ({ userId: user._id, role: 'member' }));
    const w = new Workspace({
      name: `${faker.company.name()} Team`,
      description: faker.company.catchPhrase(),
      ownerId: owner._id,
      members,
    } as any);
    await w.save();
    wspaces.push(w);
  }
  return wspaces;
}

async function createMeetings(n = 20, users: any[], workspaces: any[]) {
  const meetings = [] as any[];
  for (let i = 0; i < n; i++) {
    const host = randomPick(users);
    const ws = randomPick(workspaces);
    const start = faker.date.future({ years: 0.1 });
    const m = new Meeting({
      title: faker.hacker.phrase(),
      description: faker.lorem.sentence(),
      startTime: start,
      endTime: new Date(start.getTime() + 30 * 60000),
      hostId: host._id,
      attendees: users.slice(i % users.length, (i % users.length) + 3).map((u) => u._id),
      workspaceId: ws._id,
      status: 'scheduled',
    } as any);
    await m.save();
    meetings.push(m);
  }
  return meetings;
}

async function createMessages(n = 100, users: any[], meetings: any[], workspaces: any[]) {
  const messages = [] as any[];
  for (let i = 0; i < n; i++) {
    const sender = randomPick(users);
    const meeting = Math.random() < 0.7 ? randomPick(meetings) : undefined;
    const workspace = Math.random() < 0.9 ? randomPick(workspaces) : undefined;
    const msg = new Message({
      content: faker.lorem.sentence(),
      senderId: sender._id,
      meetingId: meeting?._id,
      workspaceId: workspace?._id,
      type: 'text',
    } as any);
    await msg.save();
    messages.push(msg);
  }
  return messages;
}

async function createTasks(n = 50, users: any[], workspaces: any[], meetings: any[]) {
  const tasks = [] as any[];
  for (let i = 0; i < n; i++) {
    const creator = randomPick(users);
    const assignee = Math.random() < 0.8 ? randomPick(users) : undefined;
    const ws = randomPick(workspaces);
    const meeting = Math.random() < 0.3 ? randomPick(meetings) : undefined;
    const t = new Task({
      title: faker.hacker.verb() + ' ' + faker.hacker.noun(),
      description: faker.lorem.sentences(2),
      assigneeId: assignee?._id,
      creatorId: creator._id,
      meetingId: meeting?._id,
      workspaceId: ws._id,
      status: Math.random() < 0.6 ? 'todo' : Math.random() < 0.5 ? 'in_progress' : 'done',
      dueDate: faker.date.soon({ days: 30 }),
    } as any);
    await t.save();
    tasks.push(t);
  }
  return tasks;
}

async function run() {
  console.log('Connecting to', env.mongoUri);
  await connect();
  console.log('Clearing existing demo collections (users, workspaces, meetings, messages, tasks)');
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Meeting.deleteMany({}),
    Message.deleteMany({}),
    Task.deleteMany({}),
  ]);

  const users = await createUsers(10);
  console.log('Created users:', users.length);
  const workspaces = await createWorkspaces(5, users);
  console.log('Created workspaces:', workspaces.length);
  const meetings = await createMeetings(20, users, workspaces);
  console.log('Created meetings:', meetings.length);
  const messages = await createMessages(100, users, meetings, workspaces);
  console.log('Created messages:', messages.length);
  const tasks = await createTasks(50, users, workspaces, meetings);
  console.log('Created tasks:', tasks.length);

  console.log('Seeding complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
