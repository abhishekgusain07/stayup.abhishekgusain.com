import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Text,
  Link,
  Section,
} from "@react-email/components";
import * as React from "react";

interface WaitlistWelcomeEmailProps {
  userEmail: string;
}

const WaitlistWelcomeEmail = ({ userEmail }: WaitlistWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to StayUp Waitlist! 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>📊 StayUp</Text>
        </Section>

        <Text style={greeting}>Hello there!</Text>

        <Text style={paragraph}>
          Thank you for joining the <strong>StayUp waitlist</strong>!
          We're thrilled to have you as part of our community of early adopters.
        </Text>

        <Text style={paragraph}>
          We're building the most reliable uptime monitoring platform to help
          developers and businesses keep their websites online 24/7.
          You'll be among the first to experience:
        </Text>

        <Text style={featureList}>
          ✨ Global monitoring from 15+ locations
          <br />
          ⚡ Real-time alerts via email, SMS, Slack
          <br />
          📊 Comprehensive performance analytics
          <br />
          🔄 Advanced incident management
          <br />
          📱 Beautiful dashboard and mobile app
        </Text>

        <Text style={paragraph}>
          <strong>What happens next?</strong>
        </Text>

        <Text style={paragraph}>
          We're putting the finishing touches on the platform and expect to
          launch in <strong>early 2025</strong>. As a waitlist member, you'll
          receive:
        </Text>

        <Text style={benefitsList}>
          🎯 Exclusive early access
          <br />
          💎 Special launch pricing (50% off)
          <br />
          📢 Priority support
          <br />
          🎁 Extended free trial period
        </Text>

        <Text style={paragraph}>
          Have questions or want to share feedback? We&apos;d love to hear from
          you! Simply reply to this email and we'll get back to you personally.
        </Text>

        <Text style={paragraph}>Stay updated on our progress:</Text>

        <Text style={socialLinks}>
          <Link href="https://twitter.com/stayupdev" style={link}>
            Follow us on Twitter
          </Link>
          {" • "}
          <Link href="https://linkedin.com/company/stayup" style={link}>
            Connect on LinkedIn
          </Link>
        </Text>

        <Hr style={hr} />

        <Text style={signOff}>
          Thanks for your patience and support!
          <br />
          <br />
          The StayUp Team
          <br />
          <span style={title}>Keeping your websites online, always</span>
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          You're receiving this because you signed up for our waitlist with{" "}
          {userEmail}.
          <br />
          Not interested anymore?{" "}
          <Link
            href="mailto:support@stayup.dev?subject=Unsubscribe"
            style={link}
          >
            Unsubscribe here
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WaitlistWelcomeEmail;

WaitlistWelcomeEmail.PreviewProps = {
  userEmail: "user@example.com",
} as WaitlistWelcomeEmailProps;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  maxWidth: "580px",
  border: "1px solid #e2e8f0",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1e293b",
  margin: "0",
};

const greeting = {
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: "600",
  color: "#1e293b",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
  color: "#374151",
};

const featureList = {
  fontSize: "16px",
  lineHeight: "28px",
  marginBottom: "24px",
  color: "#374151",
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "6px",
  borderLeft: "4px solid #3b82f6",
};

const benefitsList = {
  fontSize: "16px",
  lineHeight: "28px",
  marginBottom: "24px",
  color: "#374151",
  backgroundColor: "#fef7ed",
  padding: "20px",
  borderRadius: "6px",
  borderLeft: "4px solid #f59e0b",
};

const socialLinks = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "32px",
  color: "#374151",
  textAlign: "center" as const,
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
  fontWeight: "500",
};

const signOff = {
  fontSize: "16px",
  lineHeight: "24px",
  marginTop: "32px",
  color: "#374151",
};

const title = {
  fontSize: "14px",
  color: "#6b7280",
  fontStyle: "italic",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "center" as const,
};