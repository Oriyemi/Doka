export default function Page() {
    return <div>TODO
    {/* I am building Doka, a booking platform using Next.js, TypeScript, Better Auth, PostgreSQL, and Supabase Storage.

I already have an ID verification upload action called `uploadId` that:
- Checks that the user is logged in and has the `provider` role.
- Validates uploaded ID images (JPG, PNG, WebP, maximum 4 MB).
- Uploads the image to my private Supabase Storage bucket named `id-cards`.
- Saves the image path in the PostgreSQL `store` table.
- Sets `verification_status` to `'pending'`.
- Redirects the provider to `/provider/dashboard`.

**I want you to integrate Google Gemini AI into my existing verification flow so Doka can read the provider's ID and compare the name on the ID with the name on their Doka account.**

### Requirements

1. **Inspect my existing code first.** Find my current authentication configuration, database schema, ID upload action, verification pages, environment variables, and any existing Gemini integration. Reuse my existing structure and dependencies wherever possible.

2. **Integrate Gemini securely.** Use the current official Google Gemini SDK and a suitable model that supports image understanding. Keep the Gemini API key in a server-only environment variable such as `GEMINI_API_KEY`. Never expose the key to client-side code.

3. **Process the uploaded ID.** After the ID image is uploaded, securely send the image data to Gemini from the server. Ask Gemini to identify the document type, extract the person's full name, and indicate whether the name is readable. Do not treat the AI's response as guaranteed truth.

4. **Compare names.** Retrieve the provider's actual account name from my existing Better Auth user record. Compare it with the name extracted from the ID. Normalize harmless differences such as uppercase/lowercase, extra spaces, and common formatting differences. Do not assume that different name orderings or missing middle names always indicate a mismatch.

5. **Handle verification results safely.**
   - If the name appears to match and the document is readable, record a potential match.
   - If the name differs, the document is unclear, or Gemini returns an uncertain result, flag the case for manual review.
   - Do not automatically approve identity based only on an AI name match.
   - Do not automatically reject a person because of spelling variations or an AI error.
   - Do not change the provider to verified until the required review and approval process is completed.

6. **Update the database appropriately.** Inspect my existing schema before proposing database changes. Reuse existing verification fields where appropriate, and explain any migration needed before adding new fields. Store only the minimum necessary information, such as the extracted name, comparison outcome, and review status. Never store the raw ID image or sensitive extracted data in application logs.

7. **Preserve privacy and security.** My `id-cards` bucket is private. Do not create public URLs or expose identity images to customers. Ensure only authorized server-side code and designated reviewers can access the images. Do not assume Supabase Storage is protected simply because the bucket is private; inspect its access policies too.

8. **Handle errors and cleanup.** If Gemini fails, the image cannot be read, or the database update fails, handle the failure gracefully. If an image was uploaded but its database record cannot be saved, attempt to remove the orphaned image and log any cleanup failure without logging personal ID information. Avoid deleting the previous ID photo until the replacement has been successfully processed and recorded.

9. **Update the user experience.** Show the provider an appropriate status such as `pending`, `needs_review`, or `verified`, depending on my existing design and schema. Never show Gemini's internal reasoning or sensitive ID details to the provider.

### Instructions for your implementation

- Explain the current flow and identify the exact files that need changes before editing.
- Keep my existing comments, naming conventions, authentication checks, validation rules, and unrelated code intact.
- Do not delete my database or weaken security.
- Do not rewrite the entire application or install unnecessary packages.
- Implement the integration using my actual project files and schema, not invented table columns or assumed APIs.
- If a schema change is necessary, show me the migration and explain it before applying it.
- After making the changes, provide the complete updated code for every modified file, list any required environment variables and setup commands, and explain how to test matching names, mismatched names, unreadable images, Gemini failures, and database failures.

The goal is to make Doka use Gemini to assist with ID-name verification while keeping identity documents private and leaving final identity approval under a controlled review process. */}
</div>; }
