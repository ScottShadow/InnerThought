import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      {/* Header/Navigation */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center">
          <svg
            className="text-blue-600 h-8 w-8 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <div className="text-2xl font-bold text-blue-600">InnerThought</div>
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Track Your Emotional Journey
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-8">
          InnerThought helps you discover patterns in your thoughts, track
          emotional changes, and gain insights into your mental well-being.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Journaling Now
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl text-black md:text-4xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  Emotional Analysis
                </h3>
                <p className="text-gray-200">
                  Our AI analyzes your journal entries to identify emotions and
                  track how they change over time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Theme Detection</h3>
                <p className="text-gray-200">
                  Discover recurring themes in your writing and gain insights
                  into your thought patterns.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Visual Timeline</h3>
                <p className="text-gray-200">
                  See your emotional journey visualized on an interactive
                  timeline that helps spot trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="bg-blue-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl text-gray-600 md:text-4xl font-bold mb-6">
            Unlock Advanced Insights
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Support our project with a one-time $3 contribution and gain
            lifetime access to advanced insights and pattern analysis.
          </p>
          <Link href="/subscribe">
            <Button size="lg" className="px-8 py-6 text-lg">
              Unlock Premium Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold mb-2">InnerThought</div>
            <p className="text-gray-400">
              Your personal emotional journey tracker
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-gray-400 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} InnerThought. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
