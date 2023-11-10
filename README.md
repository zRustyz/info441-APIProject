# **Project Description**

For our project, we would like to develop an external site to be able to recommend Youtube videos surrounding a set of specific niches. **Youtube's algorithm currently aims to drive user retention and engagement** regardless of the quality or content of the videos that they put on people's feeds, and constructs profiles of its individual users in the process. Our target audience would be people who want to consume content hosted on Youtube, but **do not want to rely on obfuscated recommendation algorithms** to completely inform their viewing experience. In contrast to Youtube's algorithmically curated feeds, we would be seeking to develop a site that allows users to **curate, gather, tag, and discuss videos** surrounding their specific interests. For example, a user that is passionate about gardening may have to sift through an extensive list of videos promoted to their feed on the main Youtube site, but with our developed site, this user would be able to search through other user's curated lists of videos about gardening, along with in-depth discussions about those videos and recommendations for similar videos in that list. That way, users are able to pursue their interests online on a focused site without having to consciously dodge scattered algorithmic rabbit holes. Our goal with developing this application is to put content curation back to the hands of the individual users with shared interests, especially with the growing pool of content online. We seek to uplift individual users' specific passions and interests through the combination of curated groups of videos and additional thoughtful written commentary. The importance of our platform lies in its ability to allow users to shape and contribute to their digital environment actively.

# **Technical Description**

## Architectural Diagram

![](RackMultipart20231110-1-ld28fe_html_52f032282b43008d.png)

| **GET "/signin"** | Signs in and authenticates a user |
| --- | --- |
| **GET "/user/{id}"** | Gets all posts from a specific user
 |
| **GET "/api/urls/preview"** | Gets the YouTube video preview with all metadata and embed |
| **POST "/api/posts"** | Creates a new post |

##


##


##


## Summary table with user stories

| Priority | User | Description | Technical Implementation |
| --- | --- | --- | --- |
| P0 | Curator & User | As a curator and as a user, I should have access to a login page to verify my identity and unlock additional functionally on the website to upload links to videos, comment on existing videos and upvote videos | We will use the Azure authorization to allow users and curators to log in |
| P0 | Curator | As a curator, I should be able to upload links of YouTube videos to the Web App | We will use a relational DB to store links to videos that are uploaded and the user that uploaded the video |
| P0 | Curator | As a curator, links to videos I upload should contain an overview of the video containing the thumbnail, date uploaded, video name, number of views | We will use node-fetch to fetch from the YouTube API and display the various elements previously mentioned |
| P0 | User | As a user, I should be able to click on the thumbnail of curated videos on the web app and it should take me to the video on YouTube | The thumbnail of the video should handle the click action and redirect the user to the link of the YouTube video |
| P1 | User | As a user, I should be able to interact with the curated videos by upvoting and commenting on the web app and this should, in turn, have an effect on the priority(ie showing up first, notifying other users of a popular video) of the video on the web app | We will use a relational DB to store the comments and likes for the links of every video uploaded on the web app and a function should handle the get request such that more popular videos are returned ahead of less popular videos |
| P2 | Curator | As a curator, I should be able to delete videos shared by me in the event I accidentally uploaded the link to a video I did not mean to upload | We will implement a delete request that allows the user to delete the videos in the database if the username field of that video matches their username |

## Endpoints

![](RackMultipart20231110-1-ld28fe_html_73b503f6ca3965c0.png)

## Miscellaneous Notes

- Website where users can share videos they find interesting with others
- Commenting system
- **Tagging / categories**
- Algorithms are designed to make you feel a certain way and keep you on the platform
- Embedded videos
- We want our website to be a content-curation platform
- Common interests, community aspect
- We don't aim to drive user engagement

**Target Audience:** Youtube Users who want to fed up with algorithm and would like to take some power back from the algorithm though manually curated content;

**Motive to use platform:** Reduced Reliance on algorithms to pick videos about topics

**Motive to develop platform:** We want to create a platform that allows curators to help promote high quality content they think is worth your time.

Ideas:

**Youtube API**

- Accessing channel or individual video data for more comprehensive overview with descriptive information such as comment timestamp, most liked comments, etc.
- YouTube thumbnail analyzer
- View descriptive activities of individual Google account such as assortment of comments, likes, and subscription of videos
- Web sharer but with YouTube
