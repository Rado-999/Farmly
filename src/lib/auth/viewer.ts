export type LayoutViewer =
  | { status: "anonymous" }
  | {
      status: "authenticated";
      displayName: string;
      avatarUrl: string | null;
      farmerPageHref: string | null;
    };
