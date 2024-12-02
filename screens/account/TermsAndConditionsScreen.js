import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TermsAndConditionsScreen() {
  // Section component
  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  // Bullet point component
  const BulletPoint = ({ text }) => (
    <View style={styles.bulletPoint}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>Last Updated: November 2024</Text>

        <Section title="1. Acceptance of Terms">
          <Text style={styles.paragraph}>
            Welcome to Master Price. By accessing or using our services, you agree to be bound by these terms. If you do not agree to any part of these terms, you may not use our services.
          </Text>
        </Section>

        <Section title="2. Service Description">
          <Text style={styles.paragraph}>
            Master Price is a platform that allows users to share and view product price information. Our services include but are not limited to:
          </Text>
          <BulletPoint text="Searching for product price information" />
          <BulletPoint text="Sharing product price information" />
          <BulletPoint text="Creating and managing shopping lists" />
          <BulletPoint text="Viewing price history trends" />
        </Section>

        <Section title="3. User Responsibilities">
          <Text style={styles.paragraph}>
            When using our services, users must:
          </Text>
          <BulletPoint text="Provide true and accurate price information" />
          <BulletPoint text="Not post false or misleading information" />
          <BulletPoint text="Comply with applicable laws and regulations" />
          <BulletPoint text="Respect the rights of other users" />
        </Section>

        <Section title="4. Privacy Policy">
          <Text style={styles.paragraph}>
            We value your privacy. Our Privacy Policy describes how we collect and use personal information. By using our services, you agree to our collection and use of information in accordance with our Privacy Policy.
          </Text>
        </Section>

        <Section title="5. Content Ownership">
          <Text style={styles.paragraph}>
            Price information submitted by users will be considered public information. We reserve the right to review, edit, or remove any content on the platform.
          </Text>
        </Section>

        <Section title="6. Disclaimer">
          <Text style={styles.paragraph}>
            We do not guarantee the accuracy of price information provided by users. Users should exercise their own judgment regarding the reliability of information and are responsible for any consequences of using such information.
          </Text>
        </Section>

        <Section title="7. Account Termination">
          <Text style={styles.paragraph}>
            We reserve the right to terminate user accounts for violations of these terms. Upon termination, users will lose access to their account information and historical data.
          </Text>
        </Section>

        <Section title="8. Changes to Terms">
          <Text style={styles.paragraph}>
            We may update these terms from time to time. Updated terms will be effective immediately upon posting. Continued use of our services after any changes indicates your acceptance of the updated terms.
          </Text>
        </Section>

        <Text style={styles.footer}>
          If you have any questions about these terms, please contact our support team.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#444',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
