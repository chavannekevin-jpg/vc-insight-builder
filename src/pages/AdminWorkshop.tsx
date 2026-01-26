import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, FileText, ChevronRight } from "lucide-react";

const workshopExercises = [
  {
    id: "mini-memo",
    title: "Mini Memorandum",
    description: "Guide founders through creating a concise investment memorandum covering all key sections.",
    sections: 8,
    path: "/admin/workshop/mini-memo",
    icon: FileText,
  },
];

export default function AdminWorkshop() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workshop</h1>
          <p className="text-muted-foreground mt-1">
            Manage guided exercises for accelerator cohorts
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workshopExercises.map((exercise) => (
            <Card 
              key={exercise.id}
              className="hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate(exercise.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <exercise.icon className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-lg mt-3">{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>{exercise.sections} sections</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
