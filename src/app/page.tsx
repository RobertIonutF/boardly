import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import landingImage from '@public/images/landing-image.png';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center">
              <Badge variant="outline" className="px-3 py-1">
                Introducing Boardly
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                AI-Powered Task Management
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Simplify organizing projects using Boards, Lists, and Cards with the power of AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="mt-16 flex justify-center">
              <div className="relative w-full max-w-[1200px] overflow-hidden rounded-lg border shadow-xl">
        <Image
                  src={landingImage}
                  alt="Boardly Dashboard Preview"
                  width={1200}
                  height={675}
                  className="w-full object-cover"
          priority
        />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Core Features
              </h2>
              <p className="max-w-[700px] text-muted-foreground">
                Discover how Boardly can transform your project management workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Boards, Lists, and Cards</h3>
                  <p className="text-muted-foreground">
                    Create multiple Boards to manage different projects, organize with Lists, and track tasks with Cards.
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M12 2v1" />
                      <path d="M12 21v1" />
                      <path d="m4.93 4.93-.7.7" />
                      <path d="m19.07 19.07-.7.7" />
                      <path d="M2 12h1" />
                      <path d="M21 12h1" />
                      <path d="m4.93 19.07-.7-.7" />
                      <path d="m19.07 4.93-.7-.7" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">AI-Powered Board Creation</h3>
                  <p className="text-muted-foreground">
                    Input project descriptions in natural language and let AI generate structured Boards with Lists and Cards.
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M5 9h14M5 15h14" />
                      <path d="M5 5h4" />
                      <path d="M5 19h4" />
                      <path d="m15 5 4 4-4 4" />
                      <path d="m15 15 4 4-4 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Drag-and-Drop Functionality</h3>
                  <p className="text-muted-foreground">
                    Move Cards between Lists and rearrange Lists within a Board with intuitive drag-and-drop interactions.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                How It Works
              </h2>
              <p className="max-w-[700px] text-muted-foreground">
                Get started with Boardly in just a few simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mt-4">Create a Project</h3>
                <p className="text-muted-foreground">
                  Sign up for a free account and create your first project board.
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mt-4">Describe Your Project</h3>
                <p className="text-muted-foreground">
                  Use natural language to describe your project goals and requirements.
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mt-4">AI Generates Your Board</h3>
                <p className="text-muted-foreground">
                  Our AI creates a structured board with lists and cards based on your description.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Pricing Plans
              </h2>
              <p className="max-w-[700px] text-muted-foreground">
                Choose the plan that works best for you and your team.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold">Free</h3>
                  <div className="text-3xl font-bold">$0<span className="text-muted-foreground text-sm font-normal">/month</span></div>
                  <p className="text-muted-foreground">Perfect for individuals getting started.</p>
                  <ul className="grid gap-2 my-4">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Up to 3 Boards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Basic AI Board Creation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Drag-and-Drop Interface</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>
              <Card className="p-6 border-primary">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Pro</h3>
                    <Badge>Popular</Badge>
                  </div>
                  <div className="text-3xl font-bold">$9.99<span className="text-muted-foreground text-sm font-normal">/month</span></div>
                  <p className="text-muted-foreground">For professionals and small teams.</p>
                  <ul className="grid gap-2 my-4">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Unlimited Boards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Advanced AI Board Creation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Team Collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Priority Support</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  <div className="text-3xl font-bold">Custom<span className="text-muted-foreground text-sm font-normal">/month</span></div>
                  <p className="text-muted-foreground">For large organizations with specific needs.</p>
                  <ul className="grid gap-2 my-4">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Custom AI Training</span>
          </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Dedicated Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Custom Integrations</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Transform Your Workflow?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of teams already using Boardly to streamline their projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" className="px-8">
                  Get Started for Free
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Schedule a Demo
                </Button>
              </div>
            </div>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
          <Image
                  src="/logo.svg"
                  alt="Boardly Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="text-lg font-bold">Boardly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-Powered Task Management
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-sm text-muted-foreground hover:underline">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:underline">
                  Pricing
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Roadmap
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Company</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  About
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Blog
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Careers
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Cookie Policy
                </Link>
              </nav>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Boardly. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 2H2v10h10V2zM22 2h-8v10h8V2zM12 14H2v8h10v-8zM22 14h-8v8h8v-8z" />
                </svg>
                <span className="sr-only">Slack</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
