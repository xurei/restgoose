---
---
# Contributing to restgoose

You are here to help on restgoose? Great, welcome aboard! 
The following sections in order to know how to ask questions and how to work on something.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. 
In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

Restgoose is an open source project and we love to receive contributions from our community — you!

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into restgoose itself.

[//]: # Please, don't use the issue tracker for support questions. 
[//]: # Check whether the subreddit [r/restgoose/](https://www.reddit.com/r/restgoose/) can help with your issue.
[//]: # Stack Overflow is also worth considering.

## Ground Rules
### Technical
- Don't add any classes to the codebase unless absolutely needed. Err on the side of using functions.
- Keep feature versions as small as possible, preferably one new feature per version. If it does too much, break it up into smaller PRs.
- Ensure that code that goes into core meets all requirements in this checklist: 
    - General
        - [ ] Is this change useful to me, or something that I think will benefit others greatly?
        - [ ] Check for overlap with other PRs. If another PR exists, please explain why yours is different and/or better. 
        - [ ] Think carefully about the long-term implications of the change: how will it affect existing projects that are dependent on this? How will it affect my projects? If this is complicated, do I really want to maintain it forever? Is there any way it could be implemented as a separate package, for better modularity and flexibility?
    - Code quality    
        - [ ] Does it pass tslint?
        - [ ] Is it consistent?
        - [ ] Review the changes carefully, line by line. Make sure your changes are as small as possible (for example, don't fix a typo in portions of code you don't modify otherwise).
        - [ ] Take the time to get things right. PRs almost always require additional improvements to meet the bar for quality. Be very strict about quality. The better the quality in your original PR, the faster it can get merged in the master branch. 
    - Tests    
        - [ ] Does it have tests? If not, explain why there is none ("I don't know what to test" is a valid answer, as long as you explain why it's not done).
        - [ ] Do the tests pass ? If not, write a note in the PR, or fix them yourself.
        - [ ] **NEVER** disable a test before discussing it in an issue.
    - Docs
        - [ ] Does it have docs? If not, explain why there is none.
        - [ ] If any new features are added, are they in `docs/API.md` and `CHANGELOG.md`?
    - Credits
        - [ ] If this is your first PR, add your name and Github account in `docs/AUTHORS.md`.
        - [ ] Copy and paste title and PR number into `CHANGELOG.md`.

### Community
- Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.
- Be welcoming to newcomers and encourage diverse new contributors from all backgrounds. See the [code of conduct](./CODE_OF_CONDUCT.md).


[//]: # # Your First Contribution
[//]: # Help people who are new to your project understand where they can be most helpful. This is also a good time to let people know if you follow a label convention for flagging beginner issues.
[//]: # 
[//]: # > Unsure where to begin contributing to Atom? You can start by looking through these beginner and help-wanted issues:
[//]: # > Beginner issues - issues which should only require a few lines of code, and a test or two.
[//]: # > Help wanted issues - issues which should be a bit more involved than beginner issues.
[//]: # > Both issue lists are sorted by total number of comments. While not perfect, number of comments is a reasonable proxy for impact a given change will have.

[//]: # ### Bonus points: Add a link to a resource for people who have never contributed to open source before.
[//]: # Here are a couple of friendly tutorials you can include: http://makeapullrequest.com/ and http://www.firsttimersonly.com/

> Working on your first Pull Request? You can learn how from this *free* series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

[//]: # ## Getting started
[//]: # #### Give them a quick walkthrough of how to submit a contribution.
[//]: # How you write this is up to you, but some things you may want to include:
[//]: # 
[//]: # * Let them know if they need to sign a CLA, agree to a DCO, or get any other legal stuff out of the way
[//]: # * If tests are required for contributions, let them know, and explain how to run the tests
[//]: # * If you use anything other than GitHub to manage issues (ex. JIRA or Trac), let them know which tools they’ll need to contribute
[//]: # 
[//]: # >For something that is bigger than a one or two line fix:
[//]: # 
[//]: # >1. Create your own fork of the code
[//]: # >2. Do the changes in your fork
[//]: # >3. If you like the change and think the project could use it:
[//]: #     * Be sure you have followed the code style for the project.
[//]: #     * Sign the Contributor License Agreement, CLA, with the jQuery Foundation.
[//]: #     * Note the jQuery Foundation Code of Conduct.
[//]: #     * Send a pull request indicating that you have a CLA on file.
[//]: # 
[//]: # [source: [Requirejs](http://requirejs.org/docs/contributing.html)] **Need more inspiration?** [1] [Active Admin](https://github.com/activeadmin/activeadmin/blob/master/CONTRIBUTING.md#1-where-do-i-go-from-here) [2] [Node.js](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md#code-contributions) [3] [Ember.js](https://github.com/emberjs/ember.js/blob/master/CONTRIBUTING.md#pull-requests)

[//]: If you have a different process for small or obvious fixes, let them know.
[//]: # 
[//]: # > Small contributions such as fixing spelling errors, where the content is small enough to not be considered intellectual property, can be submitted by a contributor as a patch, without a CLA.
[//]: # >
[//]: # >As a rule of thumb, changes are obvious fixes if they do not introduce any new functionality or creative thinking. As long as the change does not affect functionality, some likely examples include the following:
[//]: # >* Spelling / grammar fixes
[//]: # >* Typo correction, white space and formatting changes
[//]: # >* Comment clean up
[//]: # >* Bug fixes that change default return values or error codes stored in constants
[//]: # >* Adding logging messages or debugging output
[//]: # >* Changes to ‘metadata’ files like Gemfile, .gitignore, build scripts, etc.
[//]: # >* Moving source files from one directory or package to another
[//]: # 
[//]: # [source: [Chef](https://github.com/chef/chef/blob/master/CONTRIBUTING.md#chef-obvious-fix-policy)] **Need more inspiration?** [1] [Puppet](https://github.com/puppetlabs/puppet/blob/master/CONTRIBUTING.md#making-trivial-changes)

## How to report a security vulnerability
> If you find a security vulnerability, do **NOT** open an issue. Email [**xureilab@gmail.com**](mailto:xureilab@gmail.com) instead.

Any security issues should be submitted directly to [**xureilab@gmail.com**](mailto:xureilab@gmail.com).
In order to determine whether you are dealing with a security issue, ask yourself these two questions:
- Can I access something that's not mine, or something I shouldn't have access to?
- Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. 
Note that even if you answer "no" to both questions, you may still be dealing with a security issue.
If you're unsure, just email us at [**xureilab@gmail.com**](mailto:xureilab@gmail.com).

[//]: # [source: [Travis CI](https://github.com/travis-ci/travis-ci/blob/master/CONTRIBUTING.md)] **Need more inspiration?** [1] [Celery](https://github.com/celery/celery/blob/master/CONTRIBUTING.rst#security) [2] [Express.js](https://github.com/expressjs/express/blob/master/Security.md)

## How to report a bug
When filing an issue, make sure to provide these informations:
1. Version of Node.js that you are using (`node --version`),
2. A minimal piece of code reproducing the issue,
3. The expected result,
4. The returned result

General questions should go to the subreddit [r/restgoose/](https://www.reddit.com/r/restgoose/). Also consider StackOverflow.

[//]: # [source: [Go](https://github.com/golang/go/blob/master/CONTRIBUTING.md#filing-issues)] **Need more inspiration?** [1] [Celery](https://github.com/celery/celery/blob/master/CONTRIBUTING.rst#other-bugs ) [2] [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md#reporting-bugs) (includes template)

## How to suggest a feature or enhancement
If you find yourself wishing for a feature that doesn't exist in restgoose, you are probably not alone.
There are bound to be others out there with similar needs. 

Simply open an issue with 'Feature proposal' in the title, describe the feature you would like to see, why you need it, and how it should work. 

[//]: # [source: [Elasticsearch](https://github.com/elastic/elasticsearch/blob/master/CONTRIBUTING.md#feature-requests)] **Need more inspiration?** [1] [Hoodie](https://github.com/hoodiehq/hoodie/blob/master/CONTRIBUTING.md#feature-requests) [2] [Ember.js](https://github.com/emberjs/ember.js/blob/master/CONTRIBUTING.md#requesting-a-feature)

## Code review process
The core team looks at Pull Requests on a weekly basis. 
At least one review from the core developers is required for a PR to be merged.

We usually answer to any issue or Pull Request in two working days. The reviewing and merging process takes typically less than a week.

[//]: # [source: [Puppet](https://github.com/puppetlabs/puppet/blob/master/CONTRIBUTING.md#submitting-changes)] **Need more inspiration?** [1] [Meteor](https://meteor.hackpad.com/Responding-to-GitHub-Issues-SKE2u3tkSiH ) [2] [Express.js](https://github.com/expressjs/express/blob/master/Contributing.md#becoming-a-committer)

## Community
You can discuss with the core team on Reddit: [r/restgoose/](https://www.reddit.com/r/restgoose/).

[//]: # [source: [cucumber-ruby](https://github.com/cucumber/cucumber-ruby/blob/master/CONTRIBUTING.md#talking-with-other-devs)] **Need more inspiration?**
[//]: # [1] [Chef](https://github.com/chef/chef/blob/master/CONTRIBUTING.md#-developer-office-hours) [2] [Cookiecutter](https://github.com/audreyr/cookiecutter#community)

[//]: # ## BONUS: Code, commit message and labeling conventions
[//]: # These sections are not necessary, but can help streamline the contributions you receive.
[//]: # 
[//]: # #### Explain your preferred style for code, if you have any.
[//]: # 
[//]: # **Need inspiration?** [1] [Requirejs](http://requirejs.org/docs/contributing.html#codestyle) [2] [Elasticsearch](https://github.com/elastic/elasticsearch/blob/master/CONTRIBUTING.md#contributing-to-the-elasticsearch-codebase)
[//]: # 
[//]: # #### Explain if you use any commit message conventions.
[//]: # 
[//]: # **Need inspiration?** [1] [Angular](https://github.com/angular/material/blob/master/.github/CONTRIBUTING.md#submit) [2] [Node.js](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md#step-3-commit)
[//]: # 
[//]: # #### Explain if you use any labeling conventions for issues.
[//]: # 
[//]: # **Need inspiration?** [1] [StandardIssueLabels](https://github.com/wagenet/StandardIssueLabels#standardissuelabels) [2] [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md#issue-and-pull-request-labels)
