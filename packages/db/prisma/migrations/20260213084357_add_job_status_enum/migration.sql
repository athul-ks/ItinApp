-- Create the Enum type
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Drop the old string default so it doesn't block the conversion
ALTER TABLE "Trip" ALTER COLUMN "status" DROP DEFAULT;

-- Convert the column type with the CASE mapping
ALTER TABLE "Trip" 
  ALTER COLUMN "status" TYPE "JobStatus" 
  USING (
    CASE 
      WHEN "status" = 'generated' THEN 'COMPLETED'::"JobStatus"
      ELSE 'PENDING'::"JobStatus"
    END
  );

-- Finally, set the new enum-compatible default
ALTER TABLE "Trip" ALTER COLUMN "status" SET DEFAULT 'PENDING';