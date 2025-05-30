// components/ChangelogEntry.tsx
import { Card, CardContent } from "@/components/ui/card";

interface Section {
  title: string;
  items: (string | { main: string; subItems: string[] })[];
}

interface ChangelogEntryProps {
  version: string;
  date: string;
  appName?: string;
  icon?: React.ReactNode;
  sections: Section[];
}

export default function ChangelogEntry({
  version,
  date,
  appName = "Changelog",
  icon,
  sections,
}: ChangelogEntryProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex flex-row items-center space-x-3">
        {icon && <span>{icon}</span>}
        <h1 className="text-3xl font-bold">{appName}</h1>
      </div>
      <p className="text-muted-foreground">
        Versi: <strong>{version}</strong> - {date}
      </p>

      {sections.map((section, idx) => (
        <Card key={idx}>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="list-disc list-inside space-y-2">
              {section.items.map((item, index) =>
                typeof item === "string" ? (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ) : (
                  <li key={index}>
                    <span dangerouslySetInnerHTML={{ __html: item.main }} />
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      {item.subItems.map((sub, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: sub }} />
                      ))}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
