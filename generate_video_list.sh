#!/bin/bash

# Check if the folder is provided as an argument
if [ -z "$1" ]; then
    echo "Error: No folder provided."
    exit 1
fi

FOLDER="$1"
OUTPUT_FILE="$FOLDER/video_list.txt"

echo "Generating the video list in the file: $OUTPUT_FILE"

# Empty the output file
> "$OUTPUT_FILE"

# Array of month names for numeric-to-month name conversion
MONTHS=("January" "February" "March" "April" "May" "June" "July" "August" "September" "October" "November" "December")

# Search for videos matching the format yyyy-mm-dd-title and sort them by file name
find "$FOLDER" -maxdepth 1 -type f -name "*.mp4" | grep -E '/[0-9]{4}-[0-9]{2}-[0-9]{2}-.*\.mp4$' | sort | while read -r filepath; do
    filename=$(basename "$filepath")
    # Exclude videos ending with "-MENU.mp4"
    if [[ "$filename" != *"-MENU.mp4" ]]; then
        # Extract the year, month, and day from the file name
        year=$(echo "$filename" | cut -d '-' -f 1)
        month=$(echo "$filename" | cut -d '-' -f 2)
        day=$(echo "$filename" | cut -d '-' -f 3)

        # Convert the month to the English month name
        month_name=${MONTHS[$((10#$month - 1))]}

        # Format the date in a human-readable format
        human_date="${day#0} $month_name $year"

        # Extract the title from the file name
        title=$(echo "$filename" | cut -d '-' -f 4- | sed 's/\.mp4$//' | sed 's/-/ /g')

        echo "$filename|$human_date|$title" >> "$OUTPUT_FILE"
    fi
done

# Remove empty lines from the output file
sed -i '/^$/d' "$OUTPUT_FILE"

echo "Video list successfully generated in the file $OUTPUT_FILE"
