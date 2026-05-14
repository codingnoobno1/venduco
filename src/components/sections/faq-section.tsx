"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Venduco?",
    answer: "Venduco is a specialized platform for the infrastructure sector, connecting vendors, laborers, and project owners with intelligent bidding and management tools.",
  },
  {
    question: "How do I register as a vendor?",
    answer: "Click the 'Register' button, choose 'Vendor', and complete the automated KYC process. You'll need your GST and other business registration documents.",
  },
  {
    question: "Are the tenders verified?",
    answer: "Yes, all tenders listed on Venduco are sourced from official government portals (like GeM) or verified private project owners.",
  },
  {
    question: "Is there a mobile app?",
    answer: "We are currently developing our mobile experience. The platform is mobile-responsive and can be used on any device.",
  },
]

export function FaqSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-blue-600">Questions</span></h2>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to know about the platform.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
