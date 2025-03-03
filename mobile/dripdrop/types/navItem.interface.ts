type ValidPageName = "Home" | "Search" | "Post" | "Bookmarks" | "Profile";

interface NavItemProps {
  name: string;
  pageName: ValidPageName;
}
