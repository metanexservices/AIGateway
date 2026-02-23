import { useState } from "react";
import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, Plus, Trash2, Edit, Search, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  department: string;
  dailyTokenLimit: number;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "1",
      email: "john@acme.com",
      name: "John Smith",
      role: "USER",
      department: "Engineering",
      dailyTokenLimit: 100000,
      createdAt: "2024-01-15T08:00:00Z",
    },
    {
      id: "2",
      email: "sarah@acme.com",
      name: "Sarah Johnson",
      role: "ADMIN",
      department: "IT Security",
      dailyTokenLimit: 500000,
      createdAt: "2024-01-10T09:00:00Z",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "USER" as const,
    department: "",
    dailyTokenLimit: 100000,
  });

  const handleAddUser = async () => {
    const mockUser: UserData = {
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, mockUser]);
    setNewUser({
      email: "",
      name: "",
      role: "USER",
      department: "",
      dailyTokenLimit: 100000,
    });
    setDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPER_ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      ADMIN: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      USER: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };
    return styles[role as keyof typeof styles];
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="mt-1 text-slate-400">Manage tenant users and access permissions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="border-cyan-500/20 bg-slate-900">
              <DialogHeader>
                <DialogTitle className="text-white">Add New User</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new user account for your tenant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Smith"
                      className="border-cyan-500/20 bg-slate-950/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john@company.com"
                      className="border-cyan-500/20 bg-slate-950/50 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-200">
                      Role
                    </Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
                    >
                      <SelectTrigger className="border-cyan-500/20 bg-slate-950/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-cyan-500/20 bg-slate-900">
                        <SelectItem value="USER" className="text-white focus:bg-cyan-500/10">
                          User
                        </SelectItem>
                        <SelectItem value="ADMIN" className="text-white focus:bg-cyan-500/10">
                          Admin
                        </SelectItem>
                        <SelectItem value="SUPER_ADMIN" className="text-white focus:bg-cyan-500/10">
                          Super Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-slate-200">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="Engineering"
                      className="border-cyan-500/20 bg-slate-950/50 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenLimit" className="text-slate-200">
                    Daily Token Limit
                  </Label>
                  <Input
                    id="tokenLimit"
                    type="number"
                    value={newUser.dailyTokenLimit}
                    onChange={(e) =>
                      setNewUser({ ...newUser, dailyTokenLimit: parseInt(e.target.value) })
                    }
                    className="border-cyan-500/20 bg-slate-950/50 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700"
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or department..."
                className="border-cyan-500/20 bg-slate-950/50 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Active Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-500/20 hover:bg-transparent">
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Department</TableHead>
                  <TableHead className="text-slate-400">Daily Limit</TableHead>
                  <TableHead className="text-slate-400">Joined</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-cyan-500/10 hover:bg-cyan-500/5">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-white">{user.department}</TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {user.dailyTokenLimit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context, "ADMIN");
};