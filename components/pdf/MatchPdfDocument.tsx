import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Match } from "@/types";
import { formatMatchTime } from "@/lib/datetime";
import {
  getMatchStatusLabel,
  getStadiumInfo,
  getStadiumTimezone,
  getTeamName
} from "@/lib/translations";

type MatchPdfDocumentProps = {
  match: Match;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 12,
    padding: 32,
    fontFamily: "Helvetica"
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 14,
    padding: 24
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 20
  },
  section: {
    marginBottom: 14
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase"
  },
  value: {
    fontSize: 13,
    color: "#111827"
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  teamName: {
    fontSize: 14,
    fontWeight: 700
  },
  score: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827"
  },
  footer: {
    marginTop: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    color: "#6b7280",
    fontSize: 10
  }
});

export function MatchPdfDocument({ match }: MatchPdfDocumentProps) {
  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const stadiumInfo = getStadiumInfo(match.stadiumId);
  const timezone = getStadiumTimezone(match.stadiumId);
  const formattedTime = formatMatchTime(match.kickoffAt, timezone);
  const score =
    typeof match.score.home === "number" && typeof match.score.away === "number"
      ? `${match.score.home} x ${match.score.away}`
      : "x";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.title}>Bolão Copa 2026</Text>
          <Text style={styles.subtitle}>Resumo do jogo</Text>

          <View style={styles.section}>
            <View style={styles.teamsRow}>
              <Text style={styles.teamName}>{homeTeamName}</Text>
              <Text style={styles.score}>{score}</Text>
              <Text style={styles.teamName}>{awayTeamName}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{getMatchStatusLabel(match.status)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Estádio</Text>
            <Text style={styles.value}>
              {stadiumInfo ? `${stadiumInfo.name} · ${stadiumInfo.city}` : match.stadiumId}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Horário</Text>
            <Text style={styles.value}>{formattedTime}</Text>
          </View>

          <Text style={styles.footer}>Gerado pelo Bolão Copa 2026</Text>
        </View>
      </Page>
    </Document>
  );
}
