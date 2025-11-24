import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Edit, Trash2, ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminArticles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    content: "",
    icon: "BookOpen",
    published: false,
  });

  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || placeholder;
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(end);

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "h1":
        newText = `${beforeText}# ${selectedText}${afterText}`;
        cursorOffset = start + 2;
        break;
      case "h2":
        newText = `${beforeText}## ${selectedText}${afterText}`;
        cursorOffset = start + 3;
        break;
      case "h3":
        newText = `${beforeText}### ${selectedText}${afterText}`;
        cursorOffset = start + 4;
        break;
      case "bold":
        newText = `${beforeText}**${selectedText}**${afterText}`;
        cursorOffset = start + 2;
        break;
      case "italic":
        newText = `${beforeText}_${selectedText}_${afterText}`;
        cursorOffset = start + 1;
        break;
      case "code":
        newText = `${beforeText}\`${selectedText}\`${afterText}`;
        cursorOffset = start + 1;
        break;
      case "quote":
        newText = `${beforeText}> ${selectedText}${afterText}`;
        cursorOffset = start + 2;
        break;
      case "ul":
        newText = `${beforeText}- ${selectedText}${afterText}`;
        cursorOffset = start + 2;
        break;
      case "ol":
        newText = `${beforeText}1. ${selectedText}${afterText}`;
        cursorOffset = start + 3;
        break;
      default:
        return;
    }

    setFormData({ ...formData, content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset + selectedText.length);
    }, 0);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      setUser(user);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchArticles();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("educational_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        slug: article.slug,
        title: article.title,
        description: article.description,
        content: article.content,
        icon: article.icon,
        published: article.published,
      });
    } else {
      setEditingArticle(null);
      setFormData({
        slug: "",
        title: "",
        description: "",
        content: "",
        icon: "BookOpen",
        published: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.slug || !formData.title || !formData.description || !formData.content) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (editingArticle) {
        const { error } = await supabase
          .from("educational_articles")
          .update(formData)
          .eq("id", editingArticle.id);

        if (error) throw error;

        toast({
          title: "Article Updated",
          description: "Your changes have been saved.",
        });
      } else {
        const { error } = await supabase
          .from("educational_articles")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Article Created",
          description: "The article has been created successfully.",
        });
      }

      setDialogOpen(false);
      fetchArticles();
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase
        .from("educational_articles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Article Deleted",
        description: "The article has been removed.",
      });

      fetchArticles();
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const { error } = await supabase
        .from("educational_articles")
        .update({ published: !article.published })
        .eq("id", article.id);

      if (error) throw error;

      toast({
        title: article.published ? "Article Unpublished" : "Article Published",
        description: `The article is now ${!article.published ? "live" : "hidden"}.`,
      });

      fetchArticles();
    } catch (error: any) {
      console.error("Error toggling publish:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary">Educational Content</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Manage Articles</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Edit Article" : "Create New Article"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL path) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="how-vcs-evaluate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="How VCs Evaluate Startups"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Learn the fundamental framework VCs use..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="BookOpen, Target, Users, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Use Lucide React icon names (e.g., BookOpen, Target, Users)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content (Markdown supported) *</Label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="space-y-2">
                      <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-md border border-b-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("h1", "Heading 1")}
                          title="Heading 1"
                        >
                          <Heading1 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("h2", "Heading 2")}
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("h3", "Heading 3")}
                          title="Heading 3"
                        >
                          <Heading3 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("bold", "bold text")}
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("italic", "italic text")}
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("code", "code")}
                          title="Inline Code"
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("ul", "list item")}
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("ol", "list item")}
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertMarkdown("quote", "quote")}
                          title="Quote"
                        >
                          <Quote className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your article content here using Markdown...

# Main Heading
## Subheading
### Section

**Bold text** or _italic text_

- Bullet point
- Another point

1. Numbered list
2. Second item

> Quote or callout

`inline code`"
                        rows={16}
                        className="font-mono text-sm rounded-t-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use the toolbar above to format your content, or write Markdown directly.
                      </p>
                    </TabsContent>
                    <TabsContent value="preview" className="min-h-[400px] p-6 border rounded-md">
                      <div className="prose prose-slate dark:prose-invert max-w-none
                        prose-headings:font-bold
                        prose-h1:text-3xl prose-h1:mb-4
                        prose-h2:text-2xl prose-h2:mb-3 prose-h2:text-primary
                        prose-h3:text-xl prose-h3:mb-2
                        prose-p:mb-4 prose-p:leading-relaxed
                        prose-strong:font-semibold
                        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formData.content || "_No content to preview_"}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, published: checked })
                    }
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Article</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ModernCard>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles yet. Create your first one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell className="font-mono text-sm">{article.slug}</TableCell>
                      <TableCell>
                        <Badge variant={article.published ? "default" : "secondary"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(article.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(article)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePublish(article)}
                          >
                            {article.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(article.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ModernCard>
      </main>
    </div>
  );
};

export default AdminArticles;
