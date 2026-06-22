import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

function generateInviteCode(): string {
  return nanoid(8);
}

async function assertMember(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return membership;
}

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

groupsRouter.post("/", async (req, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      inviteCode: generateInviteCode(),
      createdById: req.userId!,
      members: {
        create: { userId: req.userId!, role: "admin" },
      },
    },
  });

  res.status(201).json({ ...group, memberCount: 1, myRole: "admin" });
});

groupsRouter.get("/mine", async (req, res) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: req.userId! },
    include: { group: { include: { _count: { select: { members: true } } } } },
  });

  const groups = memberships.map((m) => ({
    ...m.group,
    memberCount: m.group._count.members,
    myRole: m.role,
  }));

  res.json(groups);
});

groupsRouter.get("/:id", async (req, res) => {
  const membership = await assertMember(req.params.id, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this group" });
    return;
  }

  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: true } },
    },
  });
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.json({
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    createdById: group.createdById,
    createdAt: group.createdAt,
    myRole: membership.role,
    members: group.members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  });
});

const joinSchema = z.object({
  code: z.string().min(1),
});

groupsRouter.post("/join", async (req, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const group = await prisma.group.findUnique({ where: { inviteCode: parsed.data.code } });
  if (!group) {
    res.status(404).json({ error: "Invalid invite code" });
    return;
  }

  const existing = await assertMember(group.id, req.userId!);
  if (existing) {
    res.json({ id: group.id, name: group.name, alreadyMember: true });
    return;
  }

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: req.userId!, role: "member" },
  });

  res.status(201).json({ id: group.id, name: group.name, alreadyMember: false });
});

groupsRouter.post("/:id/regenerate-code", async (req, res) => {
  const membership = await assertMember(req.params.id, req.userId!);
  if (!membership || membership.role !== "admin") {
    res.status(403).json({ error: "Only a group admin can regenerate the invite code" });
    return;
  }

  const group = await prisma.group.update({
    where: { id: req.params.id },
    data: { inviteCode: generateInviteCode() },
  });

  res.json({ inviteCode: group.inviteCode });
});
